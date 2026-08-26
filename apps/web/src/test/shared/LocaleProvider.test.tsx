import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleProvider, useLocale } from "../../shared/i18n/LocaleProvider";

function LocaleProbe() {
  const { locale, t } = useLocale();

  return (
    <div>
      <span>{locale}</span>
      <span>{t("common.languageKorean")}</span>
    </div>
  );
}

describe("LocaleProvider", () => {
  it("defaults to Korean when no explicit locale preference exists", () => {
    window.localStorage.removeItem("iterview-locale");
    document.documentElement.lang = "";

    render(
      <LocaleProvider>
        <LocaleProbe />
      </LocaleProvider>,
    );

    expect(screen.getByText("ko")).toBeInTheDocument();
    expect(screen.getByText("한국어")).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("ko");
  });
});
