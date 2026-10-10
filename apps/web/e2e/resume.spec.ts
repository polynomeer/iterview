import { expect, test } from "@playwright/test";
import { signUp, uploadResume } from "./support";

test("a first resume upload is ready to use and its claims take evidence", async ({ page }) => {
  await signUp(page, "resume");
  await uploadResume(page);

  await expect(page.getByText("사용 중인 버전")).toBeVisible();
  const experience = page.getByRole("region", { name: "경력과 프로젝트" });
  await expect(experience.getByText("에이컴퍼니")).toBeVisible();
  await expect(experience.getByText("정산 배치 개편")).toBeVisible();
  await expect(experience.getByText("결제 API 멱등성 도입")).toBeVisible();

  await page.getByRole("link", { name: "근거 편집" }).click();
  const claim = page.getByRole("button", { name: /처리 시간을 2시간 → 10분으로 단축했습니다/ });
  await claim.click();
  const editor = page.getByRole("region", { name: /처리 시간을 2시간 → 10분으로 단축했습니다/ });
  await editor.getByRole("textbox", { name: "상황" }).fill("월말 정산 배치가 단일 스레드로 2시간 넘게 걸렸습니다.");
  await editor.getByRole("textbox", { name: "내 역할" }).fill("배치 구조 재설계와 병렬화를 맡았습니다.");
  await editor.getByRole("textbox", { name: "측정 방법" }).fill("배치 실행 로그의 시작·종료 시각으로 측정했습니다.");
  await editor.getByRole("textbox", { name: "결과 수치" }).fill("2시간 → 10분, 3개월간 유지");
  // Fields save as focus leaves them; leaving the last one saves it too.
  await editor.getByRole("textbox", { name: "결과 수치" }).press("Tab");
  await expect(editor.getByText("저장했어요")).toBeVisible();

  await expect(page.getByRole("button", { name: /처리 시간을 2시간 → 10분으로 단축했습니다.*근거 4칸 중 4칸 작성/ })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /처리 시간을 2시간 → 10분으로 단축했습니다/ }).click();
  await expect(editor.getByRole("textbox", { name: "측정 방법" })).toHaveValue("배치 실행 로그의 시작·종료 시각으로 측정했습니다.");
});

test("a full-coverage resume interview moves to the next section after a skip", async ({ page }) => {
  await signUp(page, "interview");
  await uploadResume(page);

  await page.getByRole("navigation", { name: "주 메뉴" }).getByRole("link", { name: "면접" }).click();
  await page.getByRole("radio", { name: "전체 범위" }).click();
  await page.getByRole("button", { name: "면접 시작" }).click();
  await expect(page).toHaveURL(/\/interview\/sessions\/\d+/);

  const current = page.getByRole("region", { name: "현재 질문" });
  const firstQuestion = (await current.getByRole("heading", { level: 1 }).textContent())?.trim() ?? "";
  expect(firstQuestion).toContain("정산 배치 개편");

  await current.getByRole("button", { name: "건너뛰기" }).click();
  await expect(current.getByRole("heading", { level: 1 })).not.toHaveText(firstQuestion);
  await expect(current.getByRole("heading", { level: 1 })).not.toContainText("정산 배치 개편");
  await expect(page.getByRole("region", { name: "질문 흐름" }).getByRole("listitem")).toHaveCount(2);

  await current.getByRole("textbox", { name: "답변" }).fill(
    "외부 PG 응답이 유실될 때 중복 결제를 막으려고 멱등 키와 상태 전이 테이블을 도입했습니다. " +
      "재요청은 같은 키로 들어오면 저장된 결과를 돌려주고, 상태 전이는 한 방향으로만 허용했습니다. " +
      "그 결과 월 12건이던 중복 결제가 0건이 됐고, 장애 리허설로 재시도 시나리오를 검증했습니다.",
  );
  await current.getByRole("button", { name: "답변 제출" }).click();
  await expect(page.getByRole("region", { name: "질문 흐름" }).getByRole("listitem")).toHaveCount(3);
});

test("typing in the document editor keeps the caret where the user types", async ({ page }) => {
  await signUp(page, "editor-typing");
  await uploadResume(page);
  await page.goto(`${new URL(page.url()).pathname}/claims/document`);

  const lineEnd = process.platform === "darwin" ? "Meta+ArrowRight" : "End";
  const line = (n: number) => page.getByRole("textbox", { name: `편집 가능한 줄 ${n}`, exact: true });
  await line(1).click();
  await page.keyboard.press(lineEnd);
  await page.keyboard.press("Enter");
  await expect(line(2)).toBeFocused();

  // Each keystroke used to re-render the line and send the caret to its start: "abc" became "cba".
  await page.keyboard.type("정산 배치 개편");
  await expect(line(2)).toHaveText("정산 배치 개편");
  await page.keyboard.type(" 리드");
  await expect(line(2)).toHaveText("정산 배치 개편 리드");
});
