<script setup lang="ts">
import { StyleValue, ref, computed } from "vue";
import type { Length, WaveParameters } from "../types";
import {
  getLengthPixelNumber,
  getLengthPercentNumber,
  average,
} from "../utils";
import { useElementSize } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    width: Length;
    poles: WaveParameters[];
    color?: string;
    repeat?: boolean;
    closure?: boolean;
    smooth?: boolean | number;
  }>(),
  { color: "lightblue", repeat: true, closure: true, smooth: true },
);

const waveEl = ref<HTMLElement | null>(null);
const { width: waveElWidth, height: waveElHeight } = useElementSize(waveEl);

const style = computed<StyleValue>(() => {
  const width =
    typeof props.width === "number" ? `${props.width}px` : props.width;
  return {
    width,
    minWidth: 0,
    height: `${waveHeight.value}px`,
    marginTop: `-${waveHeight.value}px`,
  };
});

const smoothRatio = computed(() => {
  if (typeof props.smooth === "number") {
    return props.smooth > 1 ? 1 : props.smooth < 0 ? 0 : props.smooth;
  } else if (props.smooth === true) {
    return 1;
  } else {
    return 0;
  }
});

const processedPoles = computed<WaveParameters[]>(() => {
  if (!props.closure) return props.poles;
  const poles = [...props.poles];
  const firstPole = poles[0];
  const lastPole = poles[poles.length - 1];

  const firstPoleHeight = Array.isArray(firstPole)
    ? firstPole[1]
    : "height" in firstPole
    ? firstPole.height
    : 0;
  const lastPoleDistance = Array.isArray(lastPole)
    ? lastPole[0]
    : "distance" in lastPole
    ? lastPole.distance
    : 0;

  poles[0] = [0, firstPoleHeight];
  poles[poles.length - 1] = [lastPoleDistance, firstPoleHeight];

  return poles;
});

const polesPixelNumberArray = computed<number[][]>(() => {
  return processedPoles.value.map((pole) => {
    if (Array.isArray(pole)) {
      return [
        getLengthPixelNumber(pole[0], waveElWidth.value),
        getLengthPixelNumber(pole[1], waveElWidth.value),
      ];
    } else if ("height" in pole) {
      return [
        getLengthPixelNumber(pole.distance, waveElWidth.value),
        getLengthPixelNumber(pole.height, waveElWidth.value),
      ];
    } else {
      throw new Error(`Invalid pole format ${JSON.stringify(pole)}`);
    }
  });
});

const waveHeight = computed<number>(() => {
  return Math.max(...polesPixelNumberArray.value.map(([, h]) => h));
});

const waveLength = computed<number>(() => {
  return polesPixelNumberArray.value.reduce((acc, [d]) => acc + d, 0);
});

const repeatTimes = computed<number>(() => {
  if (!waveElWidth.value) return 0;
  if (!props.repeat) return 1;
  return Math.ceil(waveElWidth.value / waveLength.value);
});

const wavePath = computed<string>(() => {
  let sumDistance = 0;
  return (
    polesPixelNumberArray.value.reduce((acc, [d, h], index, arr) => {
      const avgDistanceBetweenPrev = average(d, 0);
      const controlPointDistance = sumDistance + avgDistanceBetweenPrev;
      const poleSvgY = waveElHeight.value - h;
      const poleSvgYPercent = getLengthPercentNumber(
        poleSvgY,
        waveElHeight.value,
      );

      if (index === 0) {
        return (acc += `M0 101 L0 ${poleSvgYPercent}`);
      } else {
        const prevPoleSvgY = waveElHeight.value - arr[index - 1][1];
        const prevPoleSvgYPercent = getLengthPercentNumber(
          prevPoleSvgY,
          waveElHeight.value,
        );

        let smoothness = 0;
        if (index !== arr.length - 1 && index !== 1) {
          const avgDistanceBetweenNext = average(arr[index + 1][0], 0);

          if (avgDistanceBetweenPrev >= avgDistanceBetweenNext) {
            smoothness = 0;
          } else {
            const ratio =
              (avgDistanceBetweenPrev + avgDistanceBetweenNext) /
              avgDistanceBetweenNext;
            smoothness = props.smooth
              ? ratio * avgDistanceBetweenPrev * smoothRatio.value
              : 0;
          }
        }

        const firstControlPoint = `${getLengthPercentNumber(
          controlPointDistance + smoothness,
          waveLength.value,
        )} ${prevPoleSvgYPercent}`;
        const secondControlPoint = `${getLengthPercentNumber(
          controlPointDistance - smoothness,
          waveLength.value,
        )} ${poleSvgYPercent}`;

        sumDistance += d;

        const end = `${getLengthPercentNumber(
          sumDistance,
          waveLength.value,
        )} ${poleSvgYPercent}`;

        return (acc += ` C${firstControlPoint}, ${secondControlPoint}, ${end}`);
      }
    }, "") + ` L${getLengthPercentNumber(sumDistance, waveLength.value)} 101Z`
  );
});
</script>

<template>
  <div ref="waveEl" class="vue-wave" :style="style">
    <div
      v-if="waveElWidth"
      class="vue-wave__repeat-wrapper"
      :style="{ width: waveLength * repeatTimes + 'px' }"
    >
      <svg
        v-for="i in repeatTimes"
        :key="i"
        xmlns="http://www.w3.org/2000/svg"
        :width="waveLength"
        height="100%"
        viewBox="0,0,100,100"
        preserveAspectRatio="none"
      >
        <path :d="wavePath" :fill="color"></path>
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vue-wave {
  position: relative;
  z-index: 1;
  overflow: hidden;

  &__repeat-wrapper {
    display: flex;
    height: 100%;
  }
}
</style>
