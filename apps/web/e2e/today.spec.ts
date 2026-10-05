import { expect, test } from "@playwright/test";
import { PASSWORD, signUp } from "./support";

test("a new account signs up, logs out and logs back in", async ({ page }) => {
  const email = await signUp(page, "auth");

  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page.getByRole("banner").getByRole("link", { name: "로그인" })).toBeVisible();

  await page.goto("/login");
  await page.getByRole("textbox", { name: "이메일" }).fill(email);
  await page.getByRole("textbox", { name: "비밀번호" }).fill(PASSWORD);
  await page.getByRole("main").getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "오늘" })).toBeVisible();
});

test("today's question is answered and scored", async ({ page }) => {
  await signUp(page, "today");

  const card = page.getByRole("main").getByRole("region").first();
  const title = (await card.getByRole("heading", { level: 2 }).textContent())?.trim() ?? "";
  await card.getByRole("link", { name: "답변 시작" }).click();

  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  await page.getByRole("textbox", { name: "답변 입력" }).fill(
    "결론부터 말하면 메시지마다 멱등 키를 두고 처리 결과를 저장해 중복 전달을 막습니다. " +
      "예를 들어 정산 이벤트를 소비할 때 이벤트 ID를 유니크 키로 저장하고, 이미 처리된 ID면 건너뛰었습니다. " +
      "이 방식으로 재시도 중 중복 처리 0건을 확인했습니다.",
  );
  await page.getByRole("button", { name: "제출하고 평가받기" }).click();

  await expect(page).toHaveURL(/\/attempts\/\d+/);
  await expect(page.getByRole("heading", { level: 1, name: /평가 결과/ })).toBeVisible();
  const scores = page.getByRole("region", { name: "점수 요약" });
  await expect(scores.getByText("총점")).toBeVisible();
  await expect(scores.getByRole("progressbar")).toHaveCount(6);
  await expect(page.getByRole("region", { name: "피드백" }).getByRole("listitem").first()).toBeVisible();
});

test("a weak answer comes back in the review list", async ({ page }) => {
  await signUp(page, "review");

  const card = page.getByRole("main").getByRole("region").first();
  const title = (await card.getByRole("heading", { level: 2 }).textContent())?.trim() ?? "";
  await card.getByRole("link", { name: "답변 시작" }).click();
  await page.getByRole("textbox", { name: "답변 입력" }).fill("잘 모르겠습니다. 상황에 따라 다를 것 같습니다.");
  await page.getByRole("button", { name: "제출하고 평가받기" }).click();
  await expect(page).toHaveURL(/\/attempts\/\d+/);

  await page.getByRole("navigation", { name: "주 메뉴" }).getByRole("link", { name: "복습" }).click();
  await expect(page.getByRole("main").getByText(title)).toBeVisible();
});
