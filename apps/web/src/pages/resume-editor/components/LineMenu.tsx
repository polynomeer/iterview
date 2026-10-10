import { useEffect, useRef, type ReactNode } from "react";
import type { ResumeEditorController } from "../hooks/useResumeEditorController";

/**
 * The row menu as a keyboard menu: focus moves to its first item when it opens or changes view,
 * arrow keys and Home/End move between items, and Escape closes it. Whenever focus would
 * otherwise drop to the page (Escape, or an action that just closes the menu), it returns to the
 * line the menu belongs to, or to that row's menu button on surfaces without editable lines.
 */
function LineMenuPopover({
  children,
  label,
  lineIndex,
  lineRefs,
  onClose,
  position,
}: {
  children: ReactNode;
  label: string;
  lineIndex: number;
  lineRefs: Record<number, HTMLDivElement | null>;
  onClose: () => void;
  position: { left: number; top: number };
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      window.requestAnimationFrame(() => {
        const active = document.activeElement;
        if (active && active !== document.body) {
          return;
        }
        const line = lineRefs[lineIndex];
        const grip = document.querySelector<HTMLElement>(
          `[data-line-index="${lineIndex}"] .resume-editor-document-preview__grip`,
        );
        (line ?? grip)?.focus();
      });
    };
  }, [lineIndex, lineRefs]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const current = items.indexOf(document.activeElement as HTMLElement);
    const move = (index: number) => {
      event.preventDefault();
      items[(index + items.length) % items.length]?.focus();
    };
    if (event.key === "ArrowDown") move(current + 1);
    else if (event.key === "ArrowUp") move(current - 1);
    else if (event.key === "Home") move(0);
    else if (event.key === "End") move(items.length - 1);
    else if (event.key === "Escape" || event.key === "Tab") {
      event.preventDefault();
      onClose();
    }
  }

  return (
    <div
      aria-label={label}
      className="resume-editor-document-preview__menu-popover"
      onKeyDown={onKeyDown}
      ref={menuRef}
      role="menu"
      style={{ left: `${position.left}px`, top: `${position.top}px` }}
    >
      {children}
    </div>
  );
}

/** Row menu renderers shared by the edit and review surfaces. */
export function createLineMenuRenderers(ctrl: ResumeEditorController) {
  const {
    t,
    markdownSource,
    activePreviewLineIndex,
    activePreviewLineMenuView,
    setActivePreviewLineMenuView,
    previewLineMenuPosition,
    handlePreviewLineAction,
  } = ctrl;

  function renderLineMenu(lineIndex: number, lineText: string) {
    if (activePreviewLineMenuView === "turn-into") {
      return (
        <div className="resume-editor-document-preview__menu-list" role="none">
          <button
            className="resume-editor-document-preview__menu-item"
            role="menuitem"
            onClick={() => setActivePreviewLineMenuView("root")}
            type="button"
          >
            {t("resumeEditor.back")}
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            role="menuitem"
            onClick={() => handlePreviewLineAction("heading1", lineIndex, lineText)}
            type="button"
          >
            {t("resumeEditor.heading1")}
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            role="menuitem"
            onClick={() => handlePreviewLineAction("heading2", lineIndex, lineText)}
            type="button"
          >
            {t("resumeEditor.heading2")}
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            role="menuitem"
            onClick={() => handlePreviewLineAction("bullet", lineIndex, lineText)}
            type="button"
          >
            {t("resumeEditor.bulletedList")}
          </button>
          <button
            className="resume-editor-document-preview__menu-item"
            role="menuitem"
            onClick={() => handlePreviewLineAction("quote", lineIndex, lineText)}
            type="button"
          >
            {t("resumeEditor.quote")}
          </button>
        </div>
      );
    }

    return (
      <div className="resume-editor-document-preview__menu-list" role="none">
        <button
          className="resume-editor-document-preview__menu-item"
          role="menuitem"
          onClick={() => setActivePreviewLineMenuView("turn-into")}
          type="button"
        >
          {t("resumeEditor.turnInto")}
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          role="menuitem"
          onClick={() => handlePreviewLineAction("duplicate", lineIndex, lineText)}
          type="button"
        >
          {t("resumeEditor.duplicate")}
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          role="menuitem"
          onClick={() => handlePreviewLineAction("comment", lineIndex, lineText)}
          type="button"
        >
          {t("resumeEditor.comment")}
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          role="menuitem"
          onClick={() => handlePreviewLineAction("card", lineIndex, lineText)}
          type="button"
        >
          {t("resumeEditor.createCard")}
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          role="menuitem"
          onClick={() => handlePreviewLineAction("rewrite", lineIndex, lineText)}
          type="button"
        >
          {t("resumeEditor.suggestRewrite")}
        </button>
        <button
          className="resume-editor-document-preview__menu-item"
          role="menuitem"
          onClick={() => handlePreviewLineAction("tools", lineIndex, lineText)}
          type="button"
        >
          {t("resumeEditor.openTools")}
        </button>
      </div>
    );
  }

  function renderFloatingLineMenu() {
    if (activePreviewLineIndex === null || !previewLineMenuPosition) {
      return null;
    }

    const lineText = markdownSource.split("\n")[activePreviewLineIndex] ?? "";

    return (
      <LineMenuPopover
        key={`${activePreviewLineIndex}-${activePreviewLineMenuView}`}
        label={t("resumeEditor.previewLineMenu", { line: activePreviewLineIndex + 1 })}
        lineIndex={activePreviewLineIndex}
        lineRefs={ctrl.documentEditorLineRefs.current}
        onClose={() => {
          setActivePreviewLineMenuView("root");
          ctrl.setActivePreviewLineIndex(null);
          ctrl.setPreviewLineMenuPosition(null);
        }}
        position={previewLineMenuPosition}
      >
        {renderLineMenu(activePreviewLineIndex, lineText)}
      </LineMenuPopover>
    );
  }

  return { renderLineMenu, renderFloatingLineMenu };
}
