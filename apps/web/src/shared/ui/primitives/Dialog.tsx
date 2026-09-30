import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IconButton } from "./Button";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusableWithin(element: HTMLElement) {
  return Array.from(element.querySelectorAll<HTMLElement>(FOCUSABLE));
}

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  /** Action row, typically a secondary cancel and one primary confirm button. */
  footer?: ReactNode;
  closeLabel: string;
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
};

/**
 * Modal dialog: labelled by its title, traps Tab focus, closes on Escape or backdrop click,
 * locks page scroll, and returns focus to the element that opened it.
 */
export function Dialog({ open, onClose, title, description, footer, closeLabel, size = "md", children }: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const surface = surfaceRef.current;
    const [firstFocusable] = surface ? focusableWithin(surface) : [];
    (firstFocusable ?? surface)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !surface) {
        return;
      }
      const focusable = focusableWithin(surface);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="ui-dialog__backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={`ui-dialog ui-dialog--${size}`}
        ref={surfaceRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="ui-dialog__header">
          <div>
            <h2 className="ui-dialog__title" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className="ui-dialog__description" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          <IconButton icon="close" label={closeLabel} onClick={onClose} size="sm" />
        </header>
        {children ? <div className="ui-dialog__body">{children}</div> : null}
        {footer ? <footer className="ui-dialog__footer">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}
