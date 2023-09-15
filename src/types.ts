export type Length = number | string;

export type PoleParametersObject = { distance: Length; height: Length };
export type PoleParametersTuple = [
  PoleParametersObject["distance"],
  PoleParametersObject["height"],
];
export type PoleParameters = PoleParametersObject | PoleParametersTuple;
