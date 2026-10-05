// Renders e2e/fixtures/resume.pdf, a fictional resume the journeys upload. Run from apps/web:
//   node e2e/fixtures/make-resume-pdf.mjs
// The PDF is committed so the tests do not depend on the fonts of the machine running them.
import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";

const lines = [
  "김테스트 Backend Engineer",
  "Tel 010-0000-0000 Mail kim.test@example.com",
  "SUMMARY",
  "결제와 정산 도메인에서 트랜잭션 안정성을 설계해 온 백엔드 개발자입니다.",
  "CAREER",
  "에이컴퍼니 — 백엔드 개발자 2021.1 – 2024.12",
  "정산 플랫폼과 결제 API를 개발하고 운영했습니다.",
  "PROJECTS",
  "정산 배치 개편 2023.1 – 2023.12",
  "에이컴퍼니",
  "단일 스레드 배치가 2시간 이상 걸려 월말 정산이 지연됐습니다.",
  "배치를 청크 단위 병렬 처리로 바꾸고 재시도와 실패 격리를 적용했습니다.",
  "처리 시간을 2시간 → 10분으로 단축했습니다.",
  "결제 API 멱등성 도입 2022.3 – 2022.9",
  "에이컴퍼니",
  "외부 PG 응답이 유실되면 중복 결제가 발생할 위험이 있었습니다.",
  "멱등 키와 상태 전이 테이블을 도입해 재요청을 안전하게 처리했습니다.",
  "중복 결제 건수를 월 12건 → 0건으로 줄였습니다.",
];

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(
  `<html><body style="font-family: sans-serif; font-size: 11pt">${lines.map((line) => `<p style="margin: 0 0 6px">${line}</p>`).join("")}</body></html>`,
);
await page.pdf({ path: fileURLToPath(new URL("./resume.pdf", import.meta.url)), format: "A4" });
await browser.close();
