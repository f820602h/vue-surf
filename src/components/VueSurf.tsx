import type { WaveProps, WaveExpose, ApexParameters } from "../types";
import type { DefineComponent, PropType, StyleValue } from "vue";
import {
  ref,
  computed,
  watch,
  nextTick,
  onBeforeMount,
  defineComponent,
  TransitionGroup,
  h,
  toRef,
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
    apexes: {
      type: Array as () => ApexParameters[],
      default: undefined,
    },
    apexesSeries: {
      type: Array as () => ApexParameters[][],
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
    apexesSeriesTransformDuration: {
      type: Number,
      default: undefined,
    },
    onApexesChanged: {
      type: Function as PropType<(currentApexes: ApexParameters[]) => void>,
      default: undefined,
    },
  },
  setup(props) {
    const waveEl = ref<HTMLElement | null>(null);
    const { width: waveElWidth } = useElementSize(waveEl);

    const {
      startMarquee,
      stopMarquee,
      resumeMarquee,
      pauseMarquee,
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

    const fps = useFps();
    const timestamp = ref(0);
    const {
      pause: pauseApexesSeriesTransform,
      resume: resumeApexesSeriesTransform,
    } = useRafFn(({ delta }) => {
      if (delta > fps.value * 3) return;
      timestamp.value += delta;
    });

    onBeforeMount(() => {
      pauseApexesSeriesTransform();
      if (props.apexesSeries && props.apexesSeries.length > 0) {
        resumeApexesSeriesTransform();
      }
    });
    watch(
      () => props.apexesSeries,
      (val) => {
        if (val && val.length > 0) resumeApexesSeriesTransform();
        else pauseApexesSeriesTransform();
      },
    );

    const duration = computed<number>(() => {
      return props.apexesSeriesTransformDuration || props.transitionDuration;
    });
    const counter = computed<number>(() => {
      return Math.floor(timestamp.value / duration.value);
    });
    const apexesSeriesIndex = computed<number>(() => {
      if (!props.apexesSeries) return 0;
      return (2 + counter.value) % props.apexesSeries.length;
    });
    const currentApexes = computed<ApexParameters[]>(() => {
      if (props.apexesSeries && props.apexesSeries.length > 0) {
        return props.apexesSeries[apexesSeriesIndex.value];
      } else if (props.apexes) {
        return props.apexes;
      } else {
        throw new Error("[Vue Wave] No apexes provided");
      }
    });

    const smoothRatio = computed<number>(() => {
      if (typeof props.smooth === "number") {
        return props.smooth > 1 ? 1 : props.smooth < 0 ? 0 : props.smooth;
      } else if (props.smooth === true) {
        return 1;
      } else {
        return 0;
      }
    });

    function closureApexes(apexes: ApexParameters[]) {
      if (!props.closure) return apexes;
      const resultApexes = [...apexes];
      const firstApex = resultApexes[0];
      const lastApex = resultApexes[resultApexes.length - 1];

      const firstApexHeight = Array.isArray(firstApex)
        ? firstApex[1]
        : "height" in firstApex
        ? firstApex.height
        : 0;
      const lastApexDistance = Array.isArray(lastApex)
        ? lastApex[0]
        : "distance" in lastApex
        ? lastApex.distance
        : 0;

      resultApexes[0] = [0, firstApexHeight];
      resultApexes[resultApexes.length - 1] = [
        lastApexDistance,
        firstApexHeight,
      ];

      return resultApexes;
    }

    function getApexesPixelNumberArray(apexes: ApexParameters[]): number[][] {
      const processedApexes = closureApexes(apexes);
      return processedApexes.map((pole) => {
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

    function getHightestApexHeight(apexes: ApexParameters[]): number {
      return Math.max(...getApexesPixelNumberArray(apexes).map(([, h]) => h));
    }

    function getApexDistanceSum(apexes: ApexParameters[]): number {
      return getApexesPixelNumberArray(apexes).reduce((acc, [d]) => acc + d, 0);
    }

    function getHeight(h: number) {
      return props.side === "bottom" ? h : waveHeight.value - h;
    }

    function getWavePath(apexes: ApexParameters[]): string {
      const apexesPixelNumberArray = getApexesPixelNumberArray(apexes);
      const origin = props.side === "bottom" ? "-0.1" : "100.1";
      let sumDistance = 0;
      let path = "";

      path += apexesPixelNumberArray.reduce((acc, [d, h], index, arr) => {
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
          const prevApexSvgY = getHeight(arr[index - 1][1]);
          const prevApexSvgYPercent = getLengthPercentNumber(
            prevApexSvgY,
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
          )} ${prevApexSvgYPercent}`;
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
      return getHightestApexHeight(currentApexes.value);
    });

    const waveLength = computed<number>(() => {
      return getApexDistanceSum(currentApexes.value);
    });

    const isRepeat = toRef(props, "repeat");
    const repeatTimes = computed<number>(() => {
      if (!waveElWidth.value) return 0;
      return Math.ceil(waveElWidth.value / waveLength.value);
    });

    const wavePath = computed<string>(() => {
      return getWavePath(currentApexes.value);
    });

    watch(
      () => currentApexes.value,
      async (newVal, oldVal) => {
        if (oldVal && newVal.length !== oldVal.length) {
          console.warn("Apexes length changed, animation may be broke.");
        }
        props.onApexesChanged?.(newVal);
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
      resumeMarquee,
      pauseMarquee,
      resumeApexesSeriesTransform,
      pauseApexesSeriesTransform,
    };

    return {
      waveEl,
      waveElWidth,
      waveHeight,
      waveLength,
      isRepeat,
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
      isRepeat,
      repeatTimes,
      wavePath,
      containerStyle,
      repeatWrapperStyle,
      svgStyle,
      pathStyle,
    } = this;

    return h(
      "div",
      { ref: "waveEl", class: "vue-wave", style: containerStyle },
      [
        waveElWidth &&
          h(
            "div",
            { class: "vue-wave__repeat-wrapper", style: repeatWrapperStyle },
            [
              repeatTimes * 5 > 0 &&
                h(TransitionGroup, { name: "wave" }, () => [
                  Array.from({ length: repeatTimes * 5 }).map((_, i) =>
                    h(
                      "svg",
                      {
                        key: i,
                        xmlns: "http://www.w3.org/2000/svg",
                        viewBox: "0,0,100,100",
                        preserveAspectRatio: "none",
                        style: svgStyle,
                      },
                      [
                        (isRepeat || i % 5 === 0) &&
                          h("path", { d: wavePath, style: pathStyle }),
                      ],
                    ),
                  ),
                ]),
            ],
          ),
      ],
    );
  },
}) as DefineComponent<WaveProps>;
