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

/** Presses Tab until [target] has focus, the way a keyboard user reaches it. */
async function tabTo(page: Page, target: ReturnType<Page["locator"]>, maxPresses = 60) {
  for (let presses = 0; presses < maxPresses; presses += 1) {
    if (await target.evaluate((element) => element === document.activeElement).catch(() => false)) {
      return;
    }
    await page.keyboard.press("Tab");
  }
  await expect(target).toBeFocused();
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
  await tabTo(page, start);
  await page.keyboard.press("Enter");

  const answer = page.getByRole("textbox", { name: "답변 입력" });
  await expect(answer).toBeVisible();
  await answer.focus();
  await page.keyboard.type("멱등 키로 중복 처리를 막고, 처리 결과를 저장해 재시도에도 같은 응답을 돌려줍니다.");
  await page.keyboard.press("ControlOrMeta+Enter");

  await expect(page).toHaveURL(/\/attempts\/\d+/);
  await expect(page.getByRole("heading", { level: 1, name: /평가 결과/ })).toBeVisible();
});

test("write flows meet WCAG AA while editing, after saving and after answering", async ({ page }) => {
  test.setTimeout(180_000);
  await signUp(page, "a11y-write");
  await uploadResume(page);
  const hub = new URL(page.url()).pathname;

  await page.goto("/interview");
  await page.getByRole("button", { name: "면접 시작" }).click();
  await expect(page).toHaveURL(/\/interview\/sessions\/\d+/);
  const session = new URL(page.url()).pathname;
  const current = page.getByRole("region", { name: "현재 질문" });
  await current.getByRole("textbox", { name: "답변" }).fill("멱등 키와 상태 전이 테이블로 중복 결제를 막았고, 월 12건이던 중복을 0건으로 줄였습니다.");
  await current.getByRole("button", { name: "답변 제출" }).click();
  await expect(page.getByRole("region", { name: "질문 흐름" }).getByText("답변함").first()).toBeVisible();

  for (const theme of THEMES) {
    await page.emulateMedia({ colorScheme: theme });

    await page.goto(`${hub}/claims`);
    await page.getByRole("button", { name: /처리 시간을 2시간 → 10분/ }).click();
    const editor = page.getByRole("region", { name: /처리 시간을 2시간 → 10분/ });
    await editor.getByRole("textbox", { name: "상황" }).fill(`월말 정산 배치가 2시간 넘게 걸렸습니다 (${theme}).`);
    await expectAccessible(page, `${theme} claim being edited`);
    await editor.getByRole("button", { name: "저장" }).click();
    await expect(editor.getByRole("button", { name: "저장" })).toBeDisabled();
    await expectAccessible(page, `${theme} claim saved`);

    await page.goto(`${hub}/claims/document`);
    await expectAccessible(page, `${theme} document editor`);

    await page.goto(session);
    await expectAccessible(page, `${theme} interview after an answer`);
    await page.goto(`${session}/result`);
    await expectAccessible(page, `${theme} interview result`);
  }
});

test("a claim's evidence can be filled and saved with the keyboard alone", async ({ page }) => {
  await signUp(page, "keyboard-claim");
  await uploadResume(page);
  await page.getByRole("link", { name: "근거 편집" }).click();

  const claim = page.getByRole("button", { name: /중복 결제 건수를 월 12건 → 0건/ });
  await tabTo(page, claim);
  await page.keyboard.press("Enter");

  const editor = page.getByRole("region", { name: /중복 결제 건수를 월 12건 → 0건/ });
  const fields: Array<[string, string]> = [
    ["상황", "외부 PG 응답 유실로 중복 결제가 생겼습니다."],
    ["내 역할", "멱등 키 설계와 상태 전이 테이블 도입을 맡았습니다."],
    ["측정 방법", "정산 대사 배치로 월별 중복 건수를 집계했습니다."],
    ["결과 수치", "월 12건 → 0건, 6개월 유지"],
  ];
  for (const [label, value] of fields) {
    const field = editor.getByRole("textbox", { name: label });
    await tabTo(page, field);
    await page.keyboard.type(value);
  }
  // Each field saves when focus leaves it, so tabbing out of the last one is the keyboard save.
  await page.keyboard.press("Tab");

  await expect(editor.getByText("저장했어요")).toBeVisible();
  await expect(page.getByRole("button", { name: /중복 결제 건수를 월 12건 → 0건.*근거 4칸 중 4칸 작성/ })).toBeVisible();
});

test("an interview question can be answered and skipped with the keyboard alone", async ({ page }) => {
  await signUp(page, "keyboard-interview");
  await uploadResume(page);
  await page.goto("/interview");

  const start = page.getByRole("button", { name: "면접 시작" });
  await tabTo(page, start);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/interview\/sessions\/\d+/);

  const current = page.getByRole("region", { name: "현재 질문" });
  const answer = current.getByRole("textbox", { name: "답변" });
  await tabTo(page, answer);
  await page.keyboard.type("배치를 청크 단위 병렬 처리로 바꾸고 재시도와 실패 격리를 적용해 2시간을 10분으로 줄였습니다.");
  await page.keyboard.press("ControlOrMeta+Enter");
  const flow = page.getByRole("region", { name: "질문 흐름" });
  await expect(flow.getByText("답변함").first()).toBeVisible();

  const next = page.getByRole("button", { name: "다음 질문" });
  if (await next.isVisible()) {
    await tabTo(page, next);
    await page.keyboard.press("Enter");
  }
  const skip = current.getByRole("button", { name: "건너뛰기" });
  await tabTo(page, skip);
  await page.keyboard.press("Enter");
  await expect(flow.getByText("건너뜀").first()).toBeVisible();
});
