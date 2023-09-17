import { ApexParameters } from "./types";

const pixelRegex = /(\d+)px/;
const percentRegex = /(\d+)%/;

export const errorText = {
  lengthPositive: "[Vue Surf] please provide a positive length value",
  lengthFormat:
    "[Vue Surf] length must be a positive number or string with unit 'px' or '%'",
  apexFormat:
    "[Vue Surf] apex must be an array of [distance, height] or {distance: number, height: number}",
  apexesFormat: "[Vue Surf] apexes must be an not empty array",
  apexesSeriesFormat: "[Vue Surf] apexesSeries must be an not empty array",
  apexesNotProvide: "[Vue Surf] please provide apexes or apexesSeries",
  apexesLengthChanged:
    "[Vue Surf] Apexes length changed, animation may be broken",
  shape: "[Vue Surf] shape must be one of 'wavy', 'serrated', 'petal'",
  side: "[Vue Surf] side must be one of 'top', 'bottom'",
};

export function lengthValidator(val: number | string) {
  if (typeof val === "number" && val <= 0) {
    throw new Error(errorText.lengthPositive);
  }
  if (typeof val === "string") {
    if (!pixelRegex.test(val) || !percentRegex.test(val)) {
      throw new Error(errorText.lengthFormat);
    } else if (parseInt(val) <= 0) {
      throw new Error(errorText.lengthPositive);
    }
  }
  return true;
}

export function apexesValidator(val: ApexParameters[]) {
  if (!val) return true;
  if (!Array.isArray(val) || (Array.isArray(val) && val.length === 0)) {
    throw new Error(errorText.apexesFormat);
  }
  return val.every((apex) => {
    if (Array.isArray(apex) && apex.length === 2) {
      return lengthValidator(apex[0]) && lengthValidator(apex[1]);
    } else if ("distance" in apex && "height" in apex) {
      return lengthValidator(apex.distance) && lengthValidator(apex.height);
    } else {
      throw new Error(errorText.apexFormat);
    }
  });
}

export function getLengthPixelNumber(
  length: number | string,
  total: number,
): number {
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
  return 0;
}

export function getLengthPercentNumber(
  length: number | string,
  total: number,
): number {
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
  return 0;
}

export function average(...arg: number[]): number {
  return arg.reduce((a, b) => a + b, 0) / arg.length;
}
