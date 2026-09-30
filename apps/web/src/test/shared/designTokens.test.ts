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
// Legacy stylesheet that predates the token layer; it shrinks as screens migrate (docs/09 Phase 5).
const LEGACY_STYLESHEETS = new Set(["app/styles/global.css"]);

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
    dark: readRoleBlock(css, ':root[data-theme="dark"],\n:root[data-theme="workspace"],\n:root[data-theme="dracula"]'),
  };
  const textPairs: Array<[foreground: string, background: string]> = [
    ["--iv-text", "--iv-bg"],
    ["--iv-text", "--iv-surface"],
    ["--iv-text-muted", "--iv-surface"],
    ["--iv-text-muted", "--iv-surface-sunken"],
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
      .filter(([path]) => path !== TOKENS_PATH && !LEGACY_STYLESHEETS.has(path))
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

  it("keeps new class names out of the legacy stylesheet so old rules cannot leak in", () => {
    const legacy = stylesheets["app/styles/global.css"];
    const collisions = Object.entries(stylesheets)
      .filter(([path]) => path !== TOKENS_PATH && !LEGACY_STYLESHEETS.has(path))
      .flatMap(([path, source]) =>
        [...new Set([...source.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/\.([a-z][a-z0-9_-]*)/g)].map((match) => match[1]))]
          .filter((className) => new RegExp(`\\.${className}(?![a-zA-Z0-9_-])`).test(legacy))
          .map((className) => `${path}: .${className}`),
      );

    expect(collisions).toEqual([]);
  });
});
