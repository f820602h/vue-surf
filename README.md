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

### shape
```typescript
enum WaveShape {
  WAVY = "wavy",
  SERRATED = "serrated",
  PETAL = "petal",
}

shape: {
  type: String as () => WaveShape,
  default: WaveShape.WAVY,
}
```
In addition to the regular wave pattern, VueSurf also offer options for a serrated and a petal-like pattern for you to choose from.

<p align="center" float="left">
  <img src="./graphs/serrated.png" alt="serrated" width="45%">
  <img src="./graphs/petal.png" alt="petal" width="45%">
</p>

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

  <img src="./graphs/apex.png" alt="apex" width="100%">

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
enum WaveSide {
  TOP = "top",
  BOTTOM = "bottom",
}

side: {
  type: String as () => WaveSide,
  default: WaveSide.TOP,
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

```html
<template>
  <section />
  <VueSurf
    :width="800"
    :apexes="[[0, 50], [100, 0], [100, 50]]"
    :repeat="false"
  />
</template>
```
<img src="./graphs/repeat.png" alt="repeat" width="60%">

<br/>

### closure
```typescript
closure: {
  type: Boolean,
  default: true,
}
```
To facilitate a natural alignment of repeated waves, the height of the last apex in an `apexes` will automatically align with the height of the first apex. You can set it to `false` to disable this behavior.

```html
<template>
  <section />
  <VueSurf
    :width="800"
    :apexes="[[0, 50], [100, 0], [100, 100]]" // higher then first apex
    :closure="false"
  />
</template>
```
<img src="./graphs/closure.png" alt="closure" width="60%">

<br/>

### smooth
```typescript
smooth: {
  type: [Boolean, Number],
  default: true,
}
```
At times, when you configure a significant difference in distance between consecutive apexes, the presentation of the wave may not appear as smooth.

To mitigate such outcomes, we perform certain calculations. However, you have the option to set it to `false` to disable this behavior.

Alternatively, you can provide a `number` value between 0 and 1 to adjust the level of smoothness.

```html
<template>
  <section />
  <VueSurf
    :width="800"
    :apexes="[ 
      [0, 50],
      [100, 0],
      [50, 100],
      [200, 0],
      [100, 50]
    ]"
    :smooth="false"
  />
</template>
```
<p align="center" float="left">
  <img src="./graphs/smooth-true.png" alt="smooth-true" width="45%">
  <img src="./graphs/smooth-false.png" alt="smooth-false" width="45%">
</p>

>If the numerical disparities are indeed substantial, the extent of smoothing may still remain limited

<br/>

### marquee
```typescript
marquee: {
  type: Boolean,
  default: true,
}
```
When you use <VueSurf>, the marquee animation effect will automatically activate. You can set it to `false` to deactivate the animation.

<img src="./graphs/marquee.gif" alt="marquee" width="60%">

<br/>

### marqueeSpeed
```typescript
marqueeSpeed: {
  type: Number,
  default: 2,
}
```
It accepts a `number` value ranging from -25 to 25 to control the speed of the marquee animation. When the value is greater than 0, the animation moves to the right; when less than 0, it moves to the left.

<br/>

### transitionDuration
```typescript
transitionDuration: {
  type: Number,
  default: 500,
}
```
When you dynamically update the `apexes` or use the `apexesSeries`, the wave undergoes a transformation animation. You can pass a `number` value to adjust the transition duration. The unit is millisecond.

<br/>

### apexesSeriesTransformDuration
```typescript
apexesSeriesTransformDuration: {
  type: Number,
  default: undefined,
}
```
To achieve a seamless animation effect, when no value is specified, it defaults to being the same as `transitionDuration`.

<br/>

### onApexesChanged
```typescript
type ApexesChangedCallback = (
  currentApexes: ApexParameters[],
  currentShape: WaveShape,
) => void;

onApexesChanged: {
  type: Function as ApexesChangedCallback,
  default: undefined,
}
```
A callback function that is invoked when there is an update to the apexes.

## Exposed Methods

```html
<script setup>
import { VueSurf } from "vue-surf";

const vueSurf = ref(null)
</script>

<template>
  <VueSurf
    ref="vueSurf"
    :width="800"
    :apexes="[[0, 50], [100, 0], [100, 50]]"
  />
  <section
    @mouseenter="vueSurfRef?.pauseMarquee()"
    @mouseleave="vueSurfRef?.playMarquee()"
  />
</template>
```

```typescript
type WaveExpose = {
  pauseMarquee: () => void;
  resumeMarquee: () => void;
  pauseApexesSeriesTransform: () => void;
  resumeApexesSeriesTransform: () => void;
};
```

### pauseMarquee
Gradually pause the marquee animation. This function becomes ineffective when `marquee` is set to `false`.

<br/>

### resumeMarquee
Gradually resume the marquee animation. This function becomes ineffective when `marquee` is set to `false`.

<br/>

### pauseApexesSeriesTransform
Resume the apexes transformation animation.

<br/>

### resumeApexesSeriesTransform
Resume the apexes transformation animation.

## License

[MIT](./LICENSE) License © 2023 [max.lee](https://github.com/f820602)