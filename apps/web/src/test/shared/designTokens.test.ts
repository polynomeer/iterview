import { describe, expect, it } from "vitest";

// Vitest stubs CSS imports (even `?raw`), so read stylesheets from disk. The app tsconfig has no
// Node types, hence the untyped dynamic import with a minimal local signature.
type FsModule = {
  readFileSync: (path: URL, encoding: "utf8") => string;
  readdirSync: (path: URL) => string[];
  statSync: (path: URL) => { isDirectory: () => boolean };
};
const fs = (await import(/* @vite-ignore */ `node:${"fs"}`)) as FsModule;
// jsdom rewrites import.meta.url to http://, so anchor on the working directory (apps/web).
const { cwd } = (globalThis as unknown as { process: { cwd: () => string } }).process;
const SRC_URL = new URL(`file://${cwd()}/src/`);
const TOKENS_PATH = "shared/theme/tokens.css";

function listStylesheets(relativeDir = ""): Record<string, string> {
  return Object.assign(
    {},
    ...fs.readdirSync(new URL(relativeDir, SRC_URL)).map((entry) => {
      const relativePath = `${relativeDir}${entry}`;
      const url = new URL(relativePath, SRC_URL);
      if (fs.statSync(url).isDirectory()) {
        return listStylesheets(`${relativePath}/`);
      }
      return relativePath.endsWith(".css") ? { [relativePath]: fs.readFileSync(url, "utf8") } : {};
    }),
  );
}

const stylesheets = listStylesheets();

function readRoleBlock(css: string, selector: string) {
  const start = css.indexOf(`${selector} {`);
  const end = css.indexOf("}", start);
  const block = css.slice(start, end);
  const roles = new Map<string, string>();

  for (const match of block.matchAll(/(--iv-[a-z0-9-]+):\s*(#[0-9a-f]{6})\s*;/gi)) {
    roles.set(match[1], match[2]);
  }

  return roles;
}

function luminance(hex: string) {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const [r, g, b] = channels.map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground: string, background: string) {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

describe("design tokens", () => {
  const css = stylesheets[TOKENS_PATH];
  const modes = {
    light: readRoleBlock(css, ':root,\n:root[data-theme="light"]'),
    dark: readRoleBlock(css, ':root[data-theme="dark"]'),
  };
  const textPairs: Array<[foreground: string, background: string]> = [
    ["--iv-text", "--iv-bg"],
    ["--iv-text", "--iv-surface"],
    ["--iv-text-muted", "--iv-surface"],
    ["--iv-text-muted", "--iv-surface-sunken"],
    ["--iv-text-subtle", "--iv-bg"],
    ["--iv-text-subtle", "--iv-surface"],
    ["--iv-text-subtle", "--iv-surface-sunken"],
    ["--iv-accent-text", "--iv-surface"],
    ["--iv-on-accent", "--iv-accent"],
    ["--iv-success", "--iv-surface"],
    ["--iv-warning", "--iv-surface"],
    ["--iv-danger", "--iv-surface"],
  ];

  it.each(Object.entries(modes))("keeps %s text roles at WCAG AA contrast", (_mode, roles) => {
    for (const [foreground, background] of textPairs) {
      const ratio = contrast(roles.get(foreground)!, roles.get(background)!);
      expect({ pair: `${foreground} on ${background}`, passes: ratio >= 4.5 }).toEqual({
        pair: `${foreground} on ${background}`,
        passes: true,
      });
    }
  });

  it("keeps raw color and font-size values inside tokens.css", () => {
    const offenders = Object.entries(stylesheets)
      .filter(([path]) => path !== TOKENS_PATH)
      .flatMap(([path, source]) =>
        source
          .split("\n")
          .map((line, index) => ({ path, line: index + 1, text: line.trim() }))
          .filter(({ text }) => /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|font-size:\s*[0-9.]/i.test(text)),
      )
      .map(({ path, line, text }) => `${path}:${line} ${text}`);

    expect(Object.keys(stylesheets)).toContain(TOKENS_PATH);
    expect(offenders).toEqual([]);
  });

  it("gives the system theme exactly the dark palette when the OS prefers dark (ADR 0082)", () => {
    const css = stylesheets[TOKENS_PATH];
    const dark = readRoleBlock(css, ':root[data-theme="dark"]');
    const systemDark = readRoleBlock(css, '  :root:not([data-theme]),\n  :root[data-theme="system"]');
    expect(dark.size).toBeGreaterThan(10);
    expect(Object.fromEntries(systemDark)).toEqual(Object.fromEntries(dark));
  });

  it("has no legacy stylesheet left: every rule is written against tokens", () => {
    const legacy = Object.keys(stylesheets).filter((path) => path === "app/styles/global.css" || /(^|\/)legacy-[^/]+\.css$/.test(path));
    expect(legacy).toEqual([]);
  });
});
