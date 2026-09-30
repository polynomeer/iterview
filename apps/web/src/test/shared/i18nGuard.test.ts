import { describe, expect, it } from "vitest";

// Reads sources from disk; see designTokens.test.ts for why the fs import is untyped.
type FsModule = {
  readFileSync: (path: URL, encoding: "utf8") => string;
  readdirSync: (path: URL) => string[];
  statSync: (path: URL) => { isDirectory: () => boolean };
};

const fs = (await import(/* @vite-ignore */ `node:${"fs"}`)) as FsModule;
const { cwd } = (globalThis as unknown as { process: { cwd: () => string } }).process;
const SRC_URL = new URL(`file://${cwd()}/src/`);

function listSources(relativeDir = ""): Record<string, string> {
  return Object.assign(
    {},
    ...fs.readdirSync(new URL(relativeDir, SRC_URL)).map((entry) => {
      const relativePath = `${relativeDir}${entry}`;
      const url = new URL(relativePath, SRC_URL);
      if (fs.statSync(url).isDirectory()) {
        return relativePath === "test" || relativePath === "shared/i18n" ? {} : listSources(`${relativePath}/`);
      }
      return /\.tsx?$/.test(relativePath) ? { [relativePath]: fs.readFileSync(url, "utf8") } : {};
    }),
  );
}

const sources = listSources();

// Korean/English copy lives in the message catalog (docs/09 §4.6); inline pairs drift apart.
const FORBIDDEN: Array<[label: string, pattern: RegExp]> = [
  ["isKorean", /\bisKorean\b/],
  ["copy(ko, en) helper", /\bcopy\(\s*["'`]/],
  ["locale ternary returning text", /locale\s*===\s*["']ko["']\s*\?\s*["'`][^"'`]*[가-힣]/],
];

describe("i18n guard", () => {
  it.each(FORBIDDEN)("has no %s outside the message catalog", (_label, pattern) => {
    const offenders = Object.entries(sources)
      .filter(([, text]) => pattern.test(text))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });
});
