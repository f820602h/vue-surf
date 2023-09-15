<script setup lang="ts">
import { StyleValue, ref, computed, watch, nextTick } from "vue";
import type { WaveProps, WaveExpose, PoleParameters } from "../types";
import {
  getLengthPixelNumber,
  getLengthPercentNumber,
  average,
} from "../utils";
import { useMarquee } from "../composables/marquee";
import { useTimestamp } from "@vueuse/core";
import { useElementSize } from "@vueuse/core";

const props = withDefaults(defineProps<WaveProps>(), {
  poles: undefined,
  polesSeries: undefined,
  side: "top",
  color: "lightblue",
  repeat: true,
  closure: true,
  smooth: true,
  marquee: true,
  marqueeSpeed: 2,
  transitionDuration: 500,
  polesSeriesTransformDuration: 500,
});

const {
  timestamp: timestamp,
  pause: pausePolesSeriesTransform,
  resume: playPolesSeriesTransform,
} = useTimestamp({ controls: true });
const counter = computed<number>(() =>
  Math.floor(timestamp.value / props.polesSeriesTransformDuration),
);
const polesSeriesIndex = computed<number>(() => {
  if (!props.polesSeries) return 0;
  return (2 + counter.value) % props.polesSeries.length;
});
const currentPoles = computed<PoleParameters[]>(() => {
  if (props.polesSeries && props.polesSeries.length > 0) {
    return props.polesSeries[polesSeriesIndex.value];
  } else if (props.poles) {
    return props.poles;
  } else {
    throw new Error("No poles provided");
  }
});

const waveEl = ref<HTMLElement | null>(null);
const { width: waveElWidth } = useElementSize(waveEl);

const {
  startMarquee,
  playMarquee,
  pauseMarquee,
  stopMarquee,
  resetMarqueeSpeed,
} = useMarquee(waveEl, props.marqueeSpeed);
watch(
  () => waveElWidth.value && props.marquee,
  (val) => {
    if (!val) nextTick(() => stopMarquee());
    else nextTick(() => startMarquee());
  },
  { immediate: true },
);
watch(
  () => props.marqueeSpeed,
  (val) => {
    resetMarqueeSpeed(val);
  },
);

const smoothRatio = computed<number>(() => {
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

function getPoleDistanceSum(poles: PoleParameters[]): number {
  return getPolesPixelNumberArray(poles).reduce((acc, [d]) => acc + d, 0);
}

function getHeight(h: number) {
  return props.side === "bottom" ? h : waveHeight.value - h;
}

function getWavePath(poles: PoleParameters[]): string {
  const polesPixelNumberArray = getPolesPixelNumberArray(poles);
  const origin = props.side === "bottom" ? "-0.1" : "100.1";
  let sumDistance = 0;
  let path = "";

  path += polesPixelNumberArray.reduce((acc, [d, h], index, arr) => {
    const avgDistanceBetweenPrev = average(d, 0);
    const controlPointDistance = sumDistance + avgDistanceBetweenPrev;
    const poleSvgY = getHeight(h);
    const poleSvgYPercent = getLengthPercentNumber(poleSvgY, waveHeight.value);

    if (index === 0) {
      return (acc += `${poleSvgYPercent}`);
    } else {
      const prevPoleSvgY = getHeight(arr[index - 1][1]);
      const prevPoleSvgYPercent = getLengthPercentNumber(
        prevPoleSvgY,
        waveHeight.value,
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
  }, "");

  return `M0 ${origin} L0 ${path} L100 ${origin}Z`;
}

const waveHeight = computed<number>(() => {
  return getHightestPoleHeight(currentPoles.value);
});

const waveLength = computed<number>(() => {
  return getPoleDistanceSum(currentPoles.value);
});

const repeatTimes = computed<number>(() => {
  if (!waveElWidth.value) return 0;
  if (!props.repeat) return 1;
  return Math.ceil(waveElWidth.value / waveLength.value);
});

const wavePath = computed<string>(() => {
  return getWavePath(currentPoles.value);
});

watch(
  () => currentPoles.value,
  async (newVal, oldVal) => {
    if (oldVal && newVal.length !== oldVal.length) {
      console.warn("Poles length changed, animation may be broke.");
    }
  },
);

const containerStyle = computed<StyleValue>(() => {
  const width =
    typeof props.width === "number" ? `${props.width}px` : props.width;
  return {
    width,
    height: `${waveHeight.value}px`,
    marginBottom: props.side === "bottom" ? `-${waveHeight.value}px` : "0px",
    marginTop: props.side === "top" ? `-${waveHeight.value}px` : "0px",
    transition: `height ${props.transitionDuration}ms linear, margin ${props.transitionDuration}ms linear`,
  };
});
const repeatWrapperStyle = computed<StyleValue>(() => {
  return {
    width: `${waveLength.value * repeatTimes.value * 5}px`,
    maxWidth: `${waveLength.value * repeatTimes.value * 5}px`,
    transition: `height ${props.transitionDuration}ms linear, width ${props.transitionDuration}ms linear`,
  };
});
const svgStyle = computed(() => {
  return {
    width: `${waveLength.value}px`,
    height: `${waveHeight.value}px`,
    transition: `height ${props.transitionDuration}ms linear, width ${props.transitionDuration}ms linear`,
  };
});
const pathStyle = computed(() => {
  return {
    fill: props.color,
    transition: `${props.transitionDuration}ms linear`,
  };
});

defineExpose<WaveExpose>({
  playMarquee,
  pauseMarquee,
  playPolesSeriesTransform,
  pausePolesSeriesTransform,
});
</script>

<template>
  <div ref="waveEl" class="vue-wave" :style="containerStyle">
    <div
      v-if="waveElWidth"
      class="vue-wave__repeat-wrapper"
      :style="repeatWrapperStyle"
    >
      <TransitionGroup name="wave">
        <svg
          v-for="i in repeatTimes * 5"
          :key="i"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0,0,100,100"
          preserveAspectRatio="none"
          :style="svgStyle"
        >
          <path :d="wavePath" :style="pathStyle"></path>
        </svg>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vue-wave {
  position: relative;
  display: flex;
  align-items: flex-end;
  overflow: hidden;

  &__repeat-wrapper {
    position: relative;
    flex-shrink: 0;
    display: flex;
    align-items: flex-end;
    height: 100%;
    overflow: hidden;
  }

  svg {
    flex-shrink: 0;
  }
}

.wave-enter-from,
.wave-leave-to {
  flex-shrink: 1 !important;
}
</style>
