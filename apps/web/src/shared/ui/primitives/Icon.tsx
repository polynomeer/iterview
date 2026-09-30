import type { SVGProps } from "react";

// One line-icon set on a 24px grid (ADR 0076). Paths use currentColor so icons inherit text color.
const ICON_PATHS = {
  today: ["M3 10.5 12 3l9 7.5", "M5 9.5V20h14V9.5", "M10 20v-5h4v5"],
  questions: ["M6 8.5v7", "M8.3 7l7.4 3.8", "M8.3 17l7.4-3.8", "circle:6,6,2.5", "circle:6,18,2.5", "circle:18,12,2.5"],
  review: ["M4 12a8 8 0 1 0 2.4-5.7", "M4 4v4h4", "M12 8v4l3 2"],
  resume: ["M7 3h7l5 5v13H7z", "M14 3v5h5", "M10 13h6", "M10 17h6"],
  interview: ["M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z", "M5 11a7 7 0 0 0 14 0", "M12 18v3"],
  analysis: ["M4 20V10", "M10 20V4", "M16 20v-7", "M22 20H2"],
  skills: ["circle:12,12,9", "circle:12,12,5", "circle:12,12,1"],
  archive: ["M3 4h18v4H3z", "M5 8v12h14V8", "M10 12h4"],
  feed: ["M4 11a9 9 0 0 1 9 9", "M4 4a16 16 0 0 1 16 16", "circle:5,19,1"],
  settings: ["circle:12,12,3", "M12 2v3", "M12 19v3", "M4.9 4.9l2.1 2.1", "M17 17l2.1 2.1", "M2 12h3", "M19 12h3", "M4.9 19.1 7 17", "M17 7l2.1-2.1"],
  profile: ["circle:12,8,4", "M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"],
  login: ["M9 4H5v16h4", "M14 8l4 4-4 4", "M18 12H8"],
  signup: ["circle:10,8,4", "M3 21c1.3-3.6 4-5.5 7-5.5", "M18 14v6", "M15 17h6"],
  logout: ["M15 4h4v16h-4", "M10 8l-4 4 4 4", "M6 12h10"],
  search: ["circle:11,11,7", "m20 20-3.5-3.5"],
  close: ["M6 6l12 12", "M18 6 6 18"],
  check: ["m5 12 5 5 9-10"],
  alert: ["M12 3 2 21h20z", "M12 10v5", "M12 18v.01"],
  info: ["circle:12,12,9", "M12 11v5", "M12 8v.01"],
  chevronRight: ["m9 6 6 6-6 6"],
  chevronDown: ["m6 9 6 6 6-6"],
  arrowRight: ["M5 12h14", "M13 6l6 6-6 6"],
  plus: ["M12 5v14", "M5 12h14"],
  more: ["circle:5,12,1", "circle:12,12,1", "circle:19,12,1"],
} as const;

export type IconName = keyof typeof ICON_PATHS;

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: IconName;
  size?: number;
  /** Accessible name. Omit for decorative icons next to visible text. */
  label?: string;
};

export function Icon({ name, size = 18, label, className, ...rest }: IconProps) {
  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={["ui-icon", className].filter(Boolean).join(" ")}
      fill="none"
      focusable="false"
      height={size}
      role={label ? "img" : undefined}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      width={size}
      {...rest}
    >
      {ICON_PATHS[name].map((shape) => {
        if (shape.startsWith("circle:")) {
          const [cx, cy, r] = shape.slice("circle:".length).split(",");
          return <circle cx={cx} cy={cy} key={shape} r={r} />;
        }
        return <path d={shape} key={shape} />;
      })}
    </svg>
  );
}
