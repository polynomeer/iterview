import type { HTMLAttributes, PropsWithChildren } from "react";

type SectionPanelProps = PropsWithChildren<
  HTMLAttributes<HTMLElement> & {
    as?: "section" | "aside" | "div";
    variant?: "default" | "muted";
  }
>;

export function SectionPanel({
  as = "section",
  children,
  className,
  variant = "default",
  ...rest
}: SectionPanelProps) {
  const Component = as;
  const nextClassName = `page-card section-panel section-panel--${variant}${className ? ` ${className}` : ""}`;

  return (
    <Component className={nextClassName} {...rest}>
      {children}
    </Component>
  );
}
