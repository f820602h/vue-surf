<br>
<br>
<p align="center">
<img height="100" src="./graphs/logo.svg" alt="Vue Surf">
</p>

<p align="center">
Very customized animated svg wave Vue component
</p>

<p align="center"><a href="https://www.npmjs.com/package/vue-surf"><img src="https://img.shields.io/npm/v/vue-surf?color=3fb883&amp;label=" alt="NPM version"></a></p>

<br>
<br>

## Install

```
npm install vue-surf
```

## Usage

Add `<VueSurf>` component from `vue-surf` to your template, and Pass in at least two parameters, `width` and `apexes`, to `<VueSurf>`.

```html
<script setup>
import { VueSurf } from "vue-surf";
</script>

<template>
  <VueSurf
    :width="800"
    :apexes="[[0, 50], [100, 0], [100, 50]]"
  />
</template>
```
And Ta-da!

<img src="./graphs/side-top.png" alt="Vue Surf">

## Props

### width
```typescript
width: {
  type: [Number | String],
  default: "100%"
}
```

The width of the wave, accept direct `number` values representing pixels or `string` with `px` or `%` units."

<br/>

### color
```typescript
color: {
  type: String,
  default: "white",
}
```
Configuring the fill color of the wave, it accepts any standard color format.

<br/>

### apexes
```typescript
export type ApexParametersObject = {
  distance: number | string;
  height: number | string;
};
export type ApexParametersTuple = [
  ApexParametersObject["distance"],
  ApexParametersObject["height"],
];
export type ApexParameters = ApexParametersObject | ApexParametersTuple;

apexes: {
  type: Array as () => ApexParameters[],
  default: undefined,
}
```

Configuring the primary parameters of the wave involves an array composed of multiple parameter sets describing the `distance` and `height` of the apexes.

Here, the term `distance` refers to the length of separation from the **previous apex**. And `height` denotes the vertical distance of the apex from the reference plane used for calculation.

Both `distance` and `height`, similar to `width`, accept direct `number` values representing pixels or `string` with `px` or `%` units.

```typescript
const apexes = ref([
  [0, 100],
  [100, "20%"],
  {distance: "100px", height: 70}
])
```

<strong>Here are several points that warrant your attention:</strong>
> 1. Due to the absence of a preceding apex for the first apex, any distance configuration for it will be disregarded.<br/><br/>
> 2. It is noteworthy that when configured using percentages, they will be calculated relative to the width of the wave. <br/>

<br/>

### apexesSeries
```typescript
apexesSeries: {
  type: Array as () => ApexParameters[][],
  default: undefined,
}
```
An array comprised of multiple `apexes`, when the length of the array exceeds one, shall automatically initiate a transformation animation across these `apexes`.

```typescript
const apexesSeries = ref([
  [[0, 50], [100, 0], [100, 50]],
  [[0, 0], [100, 50], [100, 0]]
])
```

<img src="./graphs/apexes-series.gif" alt="apexes-series" width="60%">

> Please ensure that each `apexes` within the `apexesSeries` possesses an equal length to maintain the effectiveness of the transformation animation."

<br/>

### side
```typescript
side: {
  type: String as () => "top" | "bottom",
  default: "top",
}
```
The determination of whether the wave faces upwards or downwards also dictates whether the height of the apexes is measured from the top or the bottom.

```html
<template>
  <section />
  <VueSurf
    :width="800"
    :side="'top'"
    :apexes="[[0, 50], [100, 0], [100, 50]]"
  />
</template>

<template>
  <VueSurf
    :width="800"
    :side="'bottom'"
    :apexes="[[0, 50], [100, 0], [100, 50]]"
  />
  <section />
</template>
```

<p align="center" float="left">
  <img src="./graphs/side-top.png" alt="side-top" width="45%">
  <img src="./graphs/side-bottom.png" alt="side-bottom" width="45%">
</p>

<br/>

### repeat
```typescript
repeat: {
  type: Boolean,
  default: true,
}
```
The decision to automatically repeat is contingent upon whether the cumulative `distance` set by an `apexes` is insufficient to cover the entire `width` of the wave.


## License

[MIT](./LICENSE) License © 2023 [max.lee](https://github.com/f820602)