import { TaskTexture } from "@/types";
import type { CSSProperties } from "react";

export const TASK_COLOR_PALETTE = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f97316", "#84cc16", "#06b6d4", "#a855f7",
];

export const TASK_TEXTURES: { value: TaskTexture; label: string }[] = [
  { value: "none", label: "なし" },
  { value: "stripes", label: "ストライプ" },
  { value: "dots", label: "ドット" },
  { value: "grid", label: "グリッド" },
];

export function randomTaskColor(): string {
  return TASK_COLOR_PALETTE[Math.floor(Math.random() * TASK_COLOR_PALETTE.length)];
}

export function randomTaskTexture(): TaskTexture {
  const options: TaskTexture[] = ["none", "stripes", "dots", "grid"];
  return options[Math.floor(Math.random() * options.length)];
}

// Layered on top of the task's solid background color via backgroundImage.
export function textureBackgroundImage(texture: TaskTexture | undefined): string | undefined {
  switch (texture) {
    case "stripes":
      return "repeating-linear-gradient(45deg, rgba(255,255,255,0.35) 0 4px, transparent 4px 8px)";
    case "dots":
      return "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1.5px)";
    case "grid":
      return "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)";
    default:
      return undefined;
  }
}

// Hue-rotated complement of a hex color, used to render the actual-hours
// fill so it reads clearly against the task's own color regardless of hue.
export function complementaryColor(hex: string): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  const complementH = (h + 180) % 360;
  return `hsl(${complementH.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%)`;
}

export function taskBlockStyle(color: string, texture: TaskTexture | undefined): CSSProperties {
  const image = textureBackgroundImage(texture);
  return {
    backgroundColor: color,
    backgroundImage: image,
    backgroundSize: texture === "dots" ? "6px 6px" : texture === "grid" ? "6px 6px" : undefined,
  };
}
