<script setup lang="ts">
import { StyleValue, ref, computed, watch, nextTick } from "vue";
import type { Length, PoleParameters } from "../types";
import {
  getLengthPixelNumber,
  getLengthPercentNumber,
  average,
} from "../utils";
// import { useMarquee } from "../composables/marquee";
import { useElementSize } from "@vueuse/core";

const props = withDefaults(
  defineProps<{
    width: Length;
    poles: PoleParameters[];
    color?: string;
    repeat?: boolean;
    closure?: boolean;
    smooth?: boolean | number;
  }>(),
  {
    color: "lightblue",
    repeat: true,
    closure: true,
    smooth: true,
  },
);

const waveEl = ref<HTMLElement | null>(null);
const { width: waveElWidth, height: waveElHeight } = useElementSize(waveEl);

// const { marquee } = useMarquee(waveEl);
// watch(waveElWidth, (val) => {
//   if (!val || !waveEl.value) return;
//   nextTick(() => marquee());
// });

const smoothRatio = computed(() => {
  if (typeof props.smooth === "number") {
    return props.smooth > 1 ? 1 : props.smooth < 0 ? 0 : props.smooth;
  } else if (props.smooth === true) {
    return 1;
  } else {
    return 0;
  }
});

function closurePoles(poles: PoleParameters[]) {
  if (!props.closure) return poles;
  const resultPoles = [...poles];
  const firstPole = resultPoles[0];
  const lastPole = resultPoles[resultPoles.length - 1];

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

  resultPoles[0] = [0, firstPoleHeight];
  resultPoles[resultPoles.length - 1] = [lastPoleDistance, firstPoleHeight];

  return resultPoles;
}

function getPolesPixelNumberArray(poles: PoleParameters[]): number[][] {
  const processedPoles = closurePoles(poles);
  return processedPoles.map((pole) => {
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
}

function getHightestPoleHeight(poles: PoleParameters[]): number {
  return Math.max(...getPolesPixelNumberArray(poles).map(([, h]) => h));
}

function getPoleDistanceSum(poles: PoleParameters[]) {
  return getPolesPixelNumberArray(poles).reduce((acc, [d]) => acc + d, 0);
}

function getWavePath(poles: PoleParameters[]) {
  const polesPixelNumberArray = getPolesPixelNumberArray(poles);
  let sumDistance = 0;
  let path = "";

  for (let time = 0; time < repeatTimes.value; time++) {
    path += polesPixelNumberArray.reduce((acc, [d, h], index, arr) => {
      const avgDistanceBetweenPrev = average(d, 0);
      const controlPointDistance = sumDistance + avgDistanceBetweenPrev;
      const poleSvgY = waveElHeight.value - h;
      const poleSvgYPercent = getLengthPercentNumber(
        poleSvgY,
        waveElHeight.value,
      );

      if (index === 0) {
        return (acc += `${poleSvgYPercent}`);
      } else {
        const prevPoleSvgY = waveElHeight.value - arr[index - 1][1];
        const prevPoleSvgYPercent = getLengthPercentNumber(
          prevPoleSvgY,
          waveElHeight.value,
        );

        let smoothness = 0;
        if (index !== arr.length - 1 && index !== 1) {
          const avgDistanceBetweenNext = average(arr[index + 1][0], 0);

          const prev = avgDistanceBetweenPrev;
          const next = avgDistanceBetweenNext;
          if (prev < next) {
            const ratio = (prev + next) / next;
            smoothness = props.smooth ? ratio * prev * smoothRatio.value : 0;
          }
        }

        const firstControlPoint = `${getLengthPercentNumber(
          controlPointDistance + smoothness,
          waveLength.value * repeatTimes.value,
        )} ${prevPoleSvgYPercent}`;
        const secondControlPoint = `${getLengthPercentNumber(
          controlPointDistance - smoothness,
          waveLength.value * repeatTimes.value,
        )} ${poleSvgYPercent}`;

        sumDistance += d;
        const isLast =
          index === arr.length - 1 && time !== repeatTimes.value - 1;
        const end = `${getLengthPercentNumber(
          sumDistance,
          waveLength.value * repeatTimes.value,
        )} ${isLast ? "" : poleSvgYPercent}`;

        return (acc += ` C${firstControlPoint}, ${secondControlPoint}, ${end}`);
      }
    }, "");
  }
  // console.log(`M0 101 L0 ${path} L100 101Z`);
  return `M0 101 L0 ${path} L100 101Z`;
}

const polesRef = ref(props.poles);
const waveHeight = ref(0);
const waveLength = ref(0);
watch(
  () => props.poles,
  async (newVal, oldVal) => {
    const newWaveWidth = getHightestPoleHeight(newVal);
    const newWaveLength = getPoleDistanceSum(newVal);
    if (oldVal && newVal.length !== oldVal.length) {
      console.warn("Poles length changed, animation will be glitchy.");
      return;
    }
    // if (oldVal && newWaveWidth !== waveHeight.value) {
    //   console.warn("Poles height changed, animation will be glitchy.");
    //   return;
    // }
    // if (oldVal && newWaveLength !== waveLength.value) {
    //   console.warn("Poles distance changed, animation will be glitchy.");
    //   return;
    // }
    // console.log(repeatTimes.value);
    waveHeight.value = newWaveWidth;
    waveLength.value = newWaveLength;
    // console.log(repeatTimes.value);

    nextTick(() => (polesRef.value = newVal));
  },
  { immediate: true },
);

const repeatTimes = computed<number>(() => {
  if (!waveElWidth.value) return 0;
  if (!props.repeat) return 1;
  return Math.ceil(waveElWidth.value / waveLength.value);
});

watch(repeatTimes, (n, o) => {
  console.log(n, o);
});

const style = computed<StyleValue>(() => {
  const width =
    typeof props.width === "number" ? `${props.width}px` : props.width;
  const height = `${waveHeight.value}px`;
  return { width, height, marginTop: `-${height}` };
});

const wavePath = computed<string>(() => {
  return getWavePath(polesRef.value);
});
</script>

<template>
  <div ref="waveEl" class="vue-wave" :style="style">
    <template v-if="waveElWidth">
      <div
        v-for="j in 3"
        :key="j"
        class="vue-wave__repeat-wrapper"
        :style="{ width: waveLength * repeatTimes + 'px' }"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          :width="waveLength * repeatTimes + 'px'"
          :height="waveHeight + 'px'"
          viewBox="0,0,100,100"
          preserveAspectRatio="none"
        >
          <path :d="wavePath" :fill="color"></path>
        </svg>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.vue-wave {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  transition:
    height 0.2s linear,
    margin 0.2s linear;

  &__repeat-wrapper {
    flex-shrink: 0;
    display: flex;
    align-items: flex-end;
    height: 100%;
    transition:
      width 0.2s linear,
      height 0.2s linear;
  }

  svg {
    flex-shrink: 0;
    transition:
      width 0.2s linear,
      height 0.2s linear;

    path {
      transition: 0.2s linear;
    }
  }
}
</style>
