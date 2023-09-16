export type Length = number | string;

export type PoleParametersObject = { distance: Length; height: Length };
export type PoleParametersTuple = [
  PoleParametersObject["distance"],
  PoleParametersObject["height"],
];
export type PoleParameters = PoleParametersObject | PoleParametersTuple;

export type WaveProps = {
  width: Length;
  side?: "top" | "bottom";
  poles?: PoleParameters[];
  polesSeries?: PoleParameters[][];
  color?: string;
  repeat?: boolean;
  closure?: boolean;
  smooth?: boolean | number;
  marquee?: boolean;
  marqueeSpeed?: number;
  transitionDuration?: number;
  polesSeriesTransformDuration?: number;
  onPolesChanged?: (poles: PoleParameters[]) => void;
};

export type WaveExpose = {
  playMarquee: () => void;
  pauseMarquee: () => void;
  playPolesSeriesTransform: () => void;
  pausePolesSeriesTransform: () => void;
};
