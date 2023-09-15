import type { Length } from "./types";

const pixelRegex = /(\d+)px/;
const percentRegex = /(\d+)%/;

export function getLengthPixelNumber(length: Length, total: number): number {
  if (typeof length === "number") {
    return length;
  } else if (typeof length === "string") {
    if (pixelRegex.test(length)) {
      const match = pixelRegex.exec(length);
      if (match) return Number(match[1]);
    } else if (percentRegex.test(length)) {
      const match = percentRegex.exec(length);
      if (match) return Math.round((Number(match[1]) * total) / 100);
    }
  }
  throw new Error(`[Vue Wave] Invalid Pole format '${length}'`);
}

export function getLengthPercentNumber(length: Length, total: number): number {
  if (typeof length === "number") {
    return Number(((length / total) * 100).toFixed(2));
  } else if (typeof length === "string") {
    if (pixelRegex.test(length)) {
      const match = pixelRegex.exec(length);
      if (match) return Number(((Number(match[1]) / total) * 100).toFixed(2));
    } else if (percentRegex.test(length)) {
      const match = percentRegex.exec(length);
      if (match) return Number(match[1]);
    }
  }
  throw new Error(`[Vue Wave] Invalid Pole format ${length}`);
}

export function average(...arg: number[]): number {
  return arg.reduce((a, b) => a + b, 0) / arg.length;
}
