export type Length = number | string;

export type WaveParametersObject = {
  distance: Length;
  height: Length;
};

export type WaveParametersTuple = [Length, Length];

export type WaveParameters = WaveParametersObject | WaveParametersTuple;
