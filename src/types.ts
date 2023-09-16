export type ApexParametersObject = {
  distance: number | string;
  height: number | string;
};
export type ApexParametersTuple = [
  ApexParametersObject["distance"],
  ApexParametersObject["height"],
];
export type ApexParameters = ApexParametersObject | ApexParametersTuple;

export type WaveProps = {
  width?: number | string;
  side?: "top" | "bottom";
  apexes?: ApexParameters[];
  apexesSeries?: ApexParameters[][];
  color?: string;
  repeat?: boolean;
  closure?: boolean;
  smooth?: boolean | number;
  marquee?: boolean;
  marqueeSpeed?: number;
  transitionDuration?: number;
  apexesSeriesTransformDuration?: number;
  onApexesChanged?: (currentApexes: ApexParameters[]) => void;
};

export type WaveExpose = {
  resumeMarquee: () => void;
  pauseMarquee: () => void;
  resumeApexesSeriesTransform: () => void;
  pauseApexesSeriesTransform: () => void;
};
