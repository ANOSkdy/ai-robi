import type { SVGProps } from "react";

export type IconName = "edit" | "share" | "print" | "check";

export type IconProps = {
  name: IconName;
  size?: number;
  fill?: boolean;
};

export default function Icon({ name, size = 18, fill = false }: IconProps) {
  const fillColor = fill ? "currentColor" : "none";
  const strokeColor = fill ? "none" : "currentColor";
  const common: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    strokeWidth: 2,
    stroke: strokeColor,
    fill: fillColor,
    "aria-hidden": "true",
  };

  switch (name) {
    case "edit":
      return (
        <svg {...common}>
          <path d="M4 20h4l10-10a2.8 2.8 0 1 0-4-4L4 16v4Z" />
          <path d="M12 6l6 6" />
        </svg>
      );
    case "share":
      return (
        <svg {...common}>
          <path d="M7 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" />
          <path d="M7 7l12 5v7" />
        </svg>
      );
    case "print":
      return (
        <svg {...common}>
          <rect x="6" y="3" width="12" height="7" rx="1" />
          <rect x="6" y="14" width="12" height="7" rx="1" />
          <path d="M6 10h12" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="M4 12l5 5 11-11" />
        </svg>
      );
    default:
      return null;
  }
}
