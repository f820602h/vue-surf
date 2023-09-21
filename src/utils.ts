import {
  Apex,
  Apexes,
  WaveShape,
  WaveSide,
  LinearGradientColor,
} from "./types";

const pixelRegex = /(\d+)px/;
const percentRegex = /(\d+)%/;

export const errorText = {
  parentNoWidth:
    "[Vue Surf] parent element must have a width when using '%' to set width.",
  lengthPositive: "[Vue Surf] please provide a positive length value.",
  lengthFormat:
    "[Vue Surf] length must be a positive number or string with unit 'px' or '%'.",
  apexFormat:
    "[Vue Surf] apex must be an array of [number | string, number | string] or { distance: number, height: number }.",
  apexesFormat: "[Vue Surf] 'apexes' need at least two apexes.",
  apexesHeightZero:
    "[Vue Surf] at least one apex height must be greater than 0.",
  apexesLengthZero:
    "[Vue Surf] at least one apex length must be greater than 0.",
  apexesSeriesFormat: "[Vue Surf] apexesSeries must be a not empty array.",
  apexesLengthChanged:
    "[Vue Surf] Apexes length changed, animation may be broken.",
  apexesTotalDistanceChanged:
    "[Vue Surf] Apexes total distance changed, animation may be broken.",
  colorFormat: "[Vue Surf] color must be a string or object.",
  colorNameFormat: "[Vue Surf] color.name must be a string.",
  colorRotateFormat: "[Vue Surf] color.rotate must be a number.",
  ColorStepsFormat:
    "[Vue Surf] color.steps must be a not empty array of { offset: number, color: string, opacity?: number }.",
  colorStepOpacityFormat: "[Vue Surf] colorStep.opacity must be a number.",
  shape: "[Vue Surf] shape must be one of 'wavy', 'serrated', 'petal'.",
  side: "[Vue Surf] side must be one of 'top', 'bottom'.",
};

export function lengthValidator(val: number | string): boolean {
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

export function apexesValidator(val: Apex[]): boolean {
  if (!val) return true;
  if (!Array.isArray(val) || (Array.isArray(val) && val.length < 1)) {
    throw new Error(errorText.apexesFormat);
  }

  const isValidFormat = val.every((apex) => {
    if (Array.isArray(apex) && apex.length === 2) {
      return lengthValidator(apex[0]) && lengthValidator(apex[1]);
    } else if ("distance" in apex && "height" in apex) {
      return lengthValidator(apex.distance) && lengthValidator(apex.height);
    } else {
      throw new Error(errorText.apexesLengthZero);
    }
  });

  const atLeastOneDistanceNotZero = val.some((apex) => {
    if (Array.isArray(apex) && apex.length === 2) {
      return parseInt(apex[0] + "") > 0;
    } else if ("distance" in apex) {
      return parseInt(apex.distance + "") > 0;
    } else {
      throw new Error(errorText.apexesHeightZero);
    }
  });

  const atLeastOneHeightNotZero = val.some((apex) => {
    if (Array.isArray(apex) && apex.length === 2) {
      return parseInt(apex[1] + "") > 0;
    } else if ("height" in apex) {
      return parseInt(apex.height + "") > 0;
    } else {
      throw new Error(errorText.apexFormat);
    }
  });

  return isValidFormat && atLeastOneDistanceNotZero && atLeastOneHeightNotZero;
}

export function apexesSeriesValidator(val: Apexes[]): boolean {
  if (!val) return true;
  if (!Array.isArray(val) || (Array.isArray(val) && val.length === 0)) {
    throw new Error(errorText.apexesSeriesFormat);
  }
  return val.every((apexes) => {
    if (Array.isArray(apexes)) {
      return apexesValidator(apexes);
    } else if ("apexes" in apexes) {
      if ("shape" in apexes && !!apexes.shape) {
        return shapeValidator(apexes.shape);
      }
      return apexesValidator(apexes.apexes);
    }
    return false;
  });
}

export function shapeValidator(val: string): val is WaveShape {
  const waveShape: string[] = ["wavy", "serrated", "petal"];
  if (!val) return true;
  return waveShape.indexOf(val) !== -1;
}

export function sideValidator(val: string): val is WaveSide {
  if (!val) return true;
  const waveSide: string[] = ["top", "bottom"];
  return waveSide.indexOf(val) !== -1;
}

export function colorValidator(val: string | LinearGradientColor): boolean {
  if (!val) return true;
  if (typeof val === "string") return true;
  if (typeof val === "object") {
    if ("rotate" in val && typeof val.rotate !== "number") {
      throw new Error(errorText.colorRotateFormat);
    }
    if (!("name" in val) || typeof val.name !== "string") {
      throw new Error(errorText.colorNameFormat);
    }
    if (
      !Array.isArray(val.steps) ||
      (Array.isArray(val.steps) && val.steps.length === 0)
    ) {
      throw new Error(errorText.colorStepOpacityFormat);
    }

    return val.steps.every((colorStep) => {
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

export function debounce(func: () => void) {
  let timer = 0;
  return function () {
    if (timer) clearTimeout(timer);
    timer = window.setTimeout(func, 300);
  };
}
