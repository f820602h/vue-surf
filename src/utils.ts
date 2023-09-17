import { ApexParameters, LinearGradientColor } from "./types";

const pixelRegex = /(\d+)px/;
const percentRegex = /(\d+)%/;

export const errorText = {
  lengthPositive: "[Vue Surf] please provide a positive length value",
  lengthFormat:
    "[Vue Surf] length must be a positive number or string with unit 'px' or '%'",
  apexFormat:
    "[Vue Surf] apex must be an array of [distance, height] or {distance: number, height: number}",
  apexesFormat: "[Vue Surf] apexes must be a not empty array",
  apexesSeriesFormat: "[Vue Surf] apexesSeries must be a not empty array",
  apexesNotProvide: "[Vue Surf] please provide apexes or apexesSeries",
  apexesLengthChanged:
    "[Vue Surf] Apexes length changed, animation may be broken",
  colorFormat: "[Vue Surf] color must be a string or object",
  colorRotateFormat: "[Vue Surf] color.rotate must be a number",
  ColorStepsFormat:
    "[Vue Surf] color.colorSteps must be a not empty array of {offset: number, color: string, opacity?: number}",
  colorStepOpacityFormat: "[Vue Surf] colorStep.opacity must be a number",
  shape: "[Vue Surf] shape must be one of 'wavy', 'serrated', 'petal'",
  side: "[Vue Surf] side must be one of 'top', 'bottom'",
};

export function lengthValidator(val: number | string) {
  if (typeof val === "number" && val < 0) {
    throw new Error(errorText.lengthPositive);
  }
  if (typeof val === "string") {
    if (!pixelRegex.test(val) && !percentRegex.test(val)) {
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

export function colorValidator(val: string | LinearGradientColor) {
  if (!val) return true;
  if (typeof val === "string") return true;
  if (typeof val === "object") {
    if ("rotate" in val && typeof val.rotate !== "number") {
      throw new Error(errorText.colorRotateFormat);
    }
    if (
      !Array.isArray(val.colorSteps) ||
      (Array.isArray(val.colorSteps) && val.colorSteps.length === 0)
    ) {
      throw new Error(errorText.colorStepOpacityFormat);
    }

    return val.colorSteps.every((colorStep) => {
      if ("opacity" in colorStep && typeof colorStep.opacity !== "number") {
        throw new Error(errorText.colorStepOpacityFormat);
      }
      if (!("offset" in colorStep) || !("color" in colorStep)) {
        throw new Error(errorText.colorStepOpacityFormat);
      }
      return (
        typeof colorStep.offset === "number" &&
        typeof colorStep.color === "string"
      );
    });
  }
  throw new Error(errorText.colorFormat);
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
