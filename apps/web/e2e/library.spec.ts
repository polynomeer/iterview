import { expect, test } from "@playwright/test";
import { signUp } from "./support";

test("a saved question and its note show up in 보관함", async ({ page }) => {
  await signUp(page, "library");

  await page.goto("/questions/1");
  await expect(page.getByRole("link", { name: "답변하기" })).toBeVisible();
  const title = (await page.getByRole("heading", { level: 1 }).textContent())?.trim() ?? "";
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(page.getByRole("button", { name: "저장됨" })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("tab", { name: "노트" }).click();
  await page.getByRole("textbox", { name: "내 노트" }).fill("멱등 키는 요청 단위가 아니라 비즈니스 이벤트 단위로 잡는다.");
  await page.getByRole("button", { name: "노트 저장" }).click();
  await expect(page.getByRole("button", { name: "노트 저장" })).toBeDisabled();

  await page.getByRole("navigation", { name: "보관함" }).getByRole("link", { name: "보관함" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "보관함" })).toBeVisible();
  await expect(page.getByRole("tabpanel").getByRole("link", { name: title })).toBeVisible();
  await expect(page.getByRole("tabpanel").getByText("노트 있음")).toBeVisible();

  await page.getByRole("tab", { name: /내 노트/ }).click();
  await expect(page.getByRole("tabpanel").getByText("멱등 키는 요청 단위가 아니라 비즈니스 이벤트 단위로 잡는다.")).toBeVisible();
});
