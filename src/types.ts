export type ApexParametersObject = {
  distance: number | string;
  height: number | string;
};
export type ApexParametersTuple = [
  ApexParametersObject["distance"],
  ApexParametersObject["height"],
];
export type ApexParameters = ApexParametersObject | ApexParametersTuple;

export type ApexesChangedCallback = (
  currentApexes: ApexParameters[],
  currentShape: WaveShape,
) => void;

export type LinearGradientColor = {
  name: string;
  rotate?: number;
  steps: {
    offset: number;
    color: string;
    opacity?: number;
  }[];
};

export enum WaveShape {
  WAVY = "wavy",
  SERRATED = "serrated",
  PETAL = "petal",
}

export enum WaveSide {
  TOP = "top",
  BOTTOM = "bottom",
}

export type WaveProps = {
  width?: number | string;
  shape?: WaveShape;
  side?: WaveSide;
  apexes?: ApexParameters[];
  apexesSeries?: (
    | ApexParameters[]
    | { apexes: ApexParameters[]; shape?: WaveShape }
  )[];
  color?: string | LinearGradientColor;
  repeat?: boolean;
  closure?: boolean;
  smooth?: boolean | number;
  marquee?: boolean;
  marqueeSpeed?: number;
  transitionDuration?: number;
  apexesSeriesTransformDuration?: number;
  onApexesChanged?: ApexesChangedCallback;
};

export type WaveExpose = {
  resumeMarquee: () => void;
  pauseMarquee: () => void;
  resumeApexesSeriesTransform: () => void;
  pauseApexesSeriesTransform: () => void;
};
