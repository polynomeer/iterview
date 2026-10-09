import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { PASSWORD, signUp, uploadResume } from "./support";

const THEMES = ["light", "dark"] as const;

/** Fails with a readable list when axe finds any WCAG 2.1 A/AA violation on the current page. */
async function expectAccessible(page: Page, label: string) {
  await page.waitForLoadState("networkidle");
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const found = violations.flatMap((violation) =>
    violation.nodes.map((node) => `${label}: ${violation.id} at ${node.target.join(" ")} (${violation.help})`),
  );
  expect(found).toEqual([]);
}

/** A signed-in account with a resume, one answered question and one interview session. */
async function seedAccount(page: Page) {
  await signUp(page, "a11y");
  await uploadResume(page);
  const hub = new URL(page.url()).pathname;

  await page.goto("/questions/1/answer");
  await page.getByRole("textbox", { name: "답변 입력" }).fill("잘 모르겠습니다.");
  await page.getByRole("button", { name: "제출하고 평가받기" }).click();
  await expect(page).toHaveURL(/\/attempts\/\d+/);
  const attempt = new URL(page.url()).pathname;

  await page.goto("/interview");
  await page.getByRole("radio", { name: "전체 범위" }).click();
  await page.getByRole("button", { name: "면접 시작" }).click();
  await expect(page).toHaveURL(/\/interview\/sessions\/\d+/);
  const session = new URL(page.url()).pathname;

  return { hub, attempt, session };
}

test("sign-in screens meet WCAG AA in both themes, including a failed login", async ({ page }) => {
  for (const theme of THEMES) {
    await page.emulateMedia({ colorScheme: theme });
    for (const path of ["/login", "/signup"]) {
      await page.goto(path);
      await expectAccessible(page, `${theme} ${path}`);
    }
  }

  await page.goto("/login");
  await page.getByRole("textbox", { name: "이메일" }).fill("nobody@iterview.test");
  await page.getByRole("textbox", { name: "비밀번호" }).fill(PASSWORD);
  await page.getByRole("main").getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expectAccessible(page, "failed login");
});

test("core screens meet WCAG AA in both themes", async ({ page }) => {
  test.setTimeout(180_000);
  const { hub, attempt, session } = await seedAccount(page);
  const paths = [
    "/",
    "/questions",
    "/questions/1",
    "/questions/1/answer",
    attempt,
    "/review",
    hub,
    `${hub}/claims`,
    `${hub}/heatmap`,
    `${hub}/versions`,
    "/interview",
    session,
    "/library",
    "/settings",
    "/settings/profile",
  ];

  for (const theme of THEMES) {
    await page.emulateMedia({ colorScheme: theme });
    for (const path of paths) {
      await page.goto(path);
      await expectAccessible(page, `${theme} ${path}`);
    }
  }
});

test("open overlays and phone-width screens meet WCAG AA", async ({ page }) => {
  test.setTimeout(120_000);
  const { hub, session } = await seedAccount(page);

  await page.goto("/");
  await page.getByRole("button", { name: "검색 열기" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expectAccessible(page, "command palette");
  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/", session, "/review", `${hub}/claims`]) {
    await page.goto(path);
    await expectAccessible(page, `phone ${path}`);
  }
});

test("today's question can be answered with the keyboard alone", async ({ page }) => {
  await signUp(page, "keyboard");

  const start = page.getByRole("link", { name: "답변 시작" });
  for (let presses = 0; presses < 40 && !(await start.evaluate((el) => el === document.activeElement)); presses += 1) {
    await page.keyboard.press("Tab");
  }
  await expect(start).toBeFocused();
  await page.keyboard.press("Enter");

  const answer = page.getByRole("textbox", { name: "답변 입력" });
  await expect(answer).toBeVisible();
  await answer.focus();
  await page.keyboard.type("멱등 키로 중복 처리를 막고, 처리 결과를 저장해 재시도에도 같은 응답을 돌려줍니다.");
  await page.keyboard.press("ControlOrMeta+Enter");

  await expect(page).toHaveURL(/\/attempts\/\d+/);
  await expect(page.getByRole("heading", { level: 1, name: /평가 결과/ })).toBeVisible();
});
