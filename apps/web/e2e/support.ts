import { expect, type Page } from "@playwright/test";

export const PASSWORD = "e2e-password-1";

/** A fresh account per test keeps journeys independent of each other and of local data. */
export function uniqueEmail(label: string): string {
  return `e2e-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@iterview.test`;
}

export async function signUp(page: Page, label: string): Promise<string> {
  const email = uniqueEmail(label);
  await page.goto("/signup");
  await page.getByRole("textbox", { name: "이메일" }).fill(email);
  await page.getByRole("textbox", { name: "비밀번호" }).fill(PASSWORD);
  await page.getByRole("button", { name: "계정 만들기" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "오늘" })).toBeVisible();
  return email;
}

const RESUME_PDF = new URL("./fixtures/resume.pdf", import.meta.url).pathname;

/** Uploads the fixture resume as the user's first resume and waits for its hub. */
export async function uploadResume(page: Page): Promise<void> {
  await page.goto("/resume");
  await page.locator("input[type=file]").setInputFiles(RESUME_PDF);
  await page.getByRole("button", { name: "올리고 분석 시작" }).click();
  await expect(page).toHaveURL(/\/resume\/\d+$/, { timeout: 60_000 });
}
