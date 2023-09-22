export type LinearGradientColor = {
  name: string;
  rotate?: number;
  steps: {
    offset: number;
    color: string;
    opacity?: number;
  }[];
};

export type WaveSide = "top" | "bottom";
export type WaveShape = "wavy" | "serrated" | "petal";

export type Apex =
  | [number | string, number | string]
  | {
      distance: number | string;
      height: number | string;
    };

export type Apexes =
  | Apex[]
  | {
      apexes: Apex[];
      shape?: WaveShape;
      color?: string | LinearGradientColor;
    };

export type ApexesChangedCallback = (
  currentApexes: Apex[],
  currentShape: WaveShape,
  currentColor: string | LinearGradientColor,
) => void;

export type WaveProps = {
  width?: number | string;
  shape?: WaveShape;
  side?: WaveSide;
  apexesSeries: Apexes[];
  apexesIndex?: number;
  color?: string | LinearGradientColor;
  repeat?: boolean;
  closure?: boolean;
  smooth?: boolean | number;
  marquee?: boolean;
  marqueeSpeed?: number;
  transitionDuration?: number;
  apexesSeriesTransformAuto?: boolean;
  apexesSeriesTransformDuration?: number;
  onApexesChanged?: ApexesChangedCallback;
};
