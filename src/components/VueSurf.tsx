import type { WaveProps, WaveExpose, PoleParameters } from "../types";
import type { DefineComponent, PropType, StyleValue } from "vue";
import {
  ref,
  computed,
  watch,
  nextTick,
  onBeforeMount,
  defineComponent,
  TransitionGroup,
} from "vue";
import {
  getLengthPixelNumber,
  getLengthPercentNumber,
  average,
} from "../utils";
import { useMarquee } from "../composables/marquee";
import { useFps, useRafFn, useElementSize } from "@vueuse/core";

export const VueSurf = defineComponent({
  name: "VueSurf",
  props: {
    width: {
      type: [Number, String],
      default: "100%",
    },
    poles: {
      type: Array as () => PoleParameters[],
      default: undefined,
    },
    polesSeries: {
      type: Array as () => PoleParameters[][],
      default: undefined,
    },
    side: {
      type: String as () => "top" | "bottom",
      default: "top",
    },
    color: {
      type: String,
      default: "white",
    },
    repeat: {
      type: Boolean,
      default: true,
    },
    closure: {
      type: Boolean,
      default: true,
    },
    smooth: {
      type: [Boolean, Number],
      default: true,
    },
    marquee: {
      type: Boolean,
      default: true,
    },
    marqueeSpeed: {
      type: Number,
      default: 2,
    },
    transitionDuration: {
      type: Number,
      default: 500,
    },
    polesSeriesTransformDuration: {
      type: Number,
      default: undefined,
    },
    onPolesChanged: {
      type: Function as PropType<(currentPoles: PoleParameters[]) => void>,
      default: undefined,
    },
  },
  setup(props) {
    const fps = useFps();
    const timestamp = ref(0);
    const {
      pause: pausePolesSeriesTransform,
      resume: playPolesSeriesTransform,
    } = useRafFn(({ delta }) => {
      if (delta > fps.value * 3) return;
      timestamp.value += delta;
    });

    onBeforeMount(() => {
      pausePolesSeriesTransform();
      if (props.polesSeries && props.polesSeries.length > 0) {
        playPolesSeriesTransform();
      }
    });
    watch(
      () => props.polesSeries,
      (val) => {
        if (val && val.length > 0) playPolesSeriesTransform();
        else pausePolesSeriesTransform();
      },
    );

    const duration = computed<number>(() => {
      return props.polesSeriesTransformDuration || props.transitionDuration;
    });
    const counter = computed<number>(() => {
      return Math.floor(timestamp.value / duration.value);
    });
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
        throw new Error("[Vue Wave] No poles provided");
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
          throw new Error(
            `[Vue Wave] Invalid pole format ${JSON.stringify(pole)}`,
          );
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
        const poleSvgYPercent = getLengthPercentNumber(
          poleSvgY,
          waveHeight.value,
        );

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
        props.onPolesChanged?.(newVal);
      },
    );

    const containerStyle = computed<StyleValue>(() => {
      const width =
        typeof props.width === "number" ? `${props.width}px` : props.width;
      return {
        width,
        height: `${waveHeight.value}px`,
        marginBottom:
          props.side === "bottom" ? `-${waveHeight.value}px` : "0px",
        marginTop: props.side === "top" ? `-${waveHeight.value}px` : "0px",
        transition: `height ${props.transitionDuration}ms linear, margin ${props.transitionDuration}ms linear`,
        position: "relative",
        display: "flex",
        alignItems: props.side === "bottom" ? "flex-start" : "flex-end",
        overflow: "hidden",
      };
    });

    const repeatWrapperStyle = computed<StyleValue>(() => {
      return {
        width: `${waveLength.value * repeatTimes.value * 5}px`,
        maxWidth: `${waveLength.value * repeatTimes.value * 5}px`,
        transition: `height ${props.transitionDuration}ms linear, width ${props.transitionDuration}ms linear`,
        position: "relative",
        flexShrink: 0,
        display: "flex",
        alignItems: props.side === "bottom" ? "flex-start" : "flex-end",
        height: "100%",
        overflow: "hidden",
      };
    });

    const svgStyle = computed(() => {
      return {
        width: `${waveLength.value}px`,
        height: `${waveHeight.value}px`,
        transition: `height ${props.transitionDuration}ms linear, width ${props.transitionDuration}ms linear`,
        flexShrink: 0,
      };
    });

    const pathStyle = computed(() => {
      return {
        fill: props.color,
        transition: `${props.transitionDuration}ms linear`,
      };
    });

    const exposedProps: WaveExpose = {
      playMarquee,
      pauseMarquee,
      playPolesSeriesTransform,
      pausePolesSeriesTransform,
    };

    return {
      waveEl,
      waveElWidth,
      waveHeight,
      waveLength,
      repeatTimes,
      wavePath,
      containerStyle,
      repeatWrapperStyle,
      svgStyle,
      pathStyle,
      ...exposedProps,
    };
  },
  render() {
    const {
      waveElWidth,
      repeatTimes,
      wavePath,
      containerStyle,
      repeatWrapperStyle,
      svgStyle,
      pathStyle,
    } = this;

    return (
      <div ref="waveEl" class="vue-wave" style={containerStyle}>
        {waveElWidth && (
          <div class="vue-wave__repeat-wrapper" style={repeatWrapperStyle}>
            {repeatTimes * 5 > 0 && (
              <TransitionGroup name="wave">
                {Array.from({ length: repeatTimes * 5 }).map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0,0,100,100"
                    preserveAspectRatio="none"
                    style={svgStyle}
                  >
                    <path d={wavePath} style={pathStyle}></path>
                  </svg>
                ))}
              </TransitionGroup>
            )}
          </div>
        )}
      </div>
    );
  },
}) as DefineComponent<WaveProps>;
