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

export function taskBlockStyle(color: string, texture: TaskTexture | undefined): CSSProperties {
  const image = textureBackgroundImage(texture);
  return {
    backgroundColor: color,
    backgroundImage: image,
    backgroundSize: texture === "dots" ? "6px 6px" : texture === "grid" ? "6px 6px" : undefined,
  };
}
