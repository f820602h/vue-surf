import {
  WaveProps,
  Apex,
  Apexes,
  WaveShape,
  WaveSide,
  LinearGradientColor,
  ApexesChangedCallback,
} from "../types";
import type { DefineComponent, PropType, StyleValue } from "vue";
import {
  ref,
  computed,
  watch,
  defineComponent,
  h,
  onBeforeMount,
  onBeforeUnmount,
} from "vue";
import {
  errorText,
  lengthValidator,
  apexesSeriesValidator,
  shapeValidator,
  sideValidator,
  colorValidator,
  getLengthPixelNumber,
  debounce,
} from "../utils";
import { plotter } from "../plotter";
import { useMarquee } from "../composables/marquee";
import { useTransformation } from "../composables/transformation";
import { useElementSize } from "@vueuse/core";

export const VueSurf = defineComponent({
  name: "VueSurf",
  props: {
    width: {
      type: [Number, String],
      default: "100%",
      validator: lengthValidator,
    },
    color: {
      type: [String, Object] as PropType<string | LinearGradientColor>,
      default: "white",
      validator: colorValidator,
    },
    shape: {
      type: String as () => WaveShape,
      default: "wavy",
      validator: shapeValidator,
    },
    apexesSeries: {
      type: Array as () => Apexes[],
      required: true,
      validator: apexesSeriesValidator,
    },
    apexesIndex: {
      type: Number,
      default: undefined,
    },
    side: {
      type: String as () => WaveSide,
      default: "top",
      validator: sideValidator,
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
    apexesSeriesTransformAuto: {
      type: Boolean,
      default: true,
    },
    apexesSeriesTransformDuration: {
      type: Number,
      default: undefined,
    },
    onApexesChanged: {
      type: Function as PropType<ApexesChangedCallback>,
      default: undefined,
    },
  },
  setup(props) {
    const waveEl = ref<HTMLElement | null>(null);
    const { width: waveElWidth } = useElementSize(waveEl);

    const {
      start: startMarquee,
      stop: stopMarquee,
      resetSpeed,
    } = useMarquee(waveEl, props.marqueeSpeed);
    watch(() => props.marqueeSpeed, resetSpeed);
    watch(
      () => waveElWidth.value && props.marquee,
      (val) => {
        if (!val) stopMarquee();
        else startMarquee();
      },
      { immediate: true },
    );

    const {
      stamp: timestamp,
      pause: pauseApexesSeriesTransform,
      resume: resumeApexesSeriesTransform,
    } = useTransformation();
    watch(
      () =>
        props.apexesSeriesTransformAuto &&
        props.apexesSeries.length > 1 &&
        (props.apexesIndex === undefined || props.apexesIndex === null),
      (val) => {
        if (val) resumeApexesSeriesTransform();
        else pauseApexesSeriesTransform();
      },
      { immediate: true },
    );

    const isTransition = ref<boolean>(true);
    const resetTransition = debounce(() => {
      isTransition.value = true;
    });
    function transitionToggle() {
      isTransition.value = false;
      resetTransition();
    }
    onBeforeMount(() => {
      window.addEventListener("resize", transitionToggle);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("resize", transitionToggle);
    });

    function getClosureApexes(apexes: Apex[]): Apex[] {
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
    function getApexesPixelNumberArray(apexes: Apex[]): number[][] {
      return getClosureApexes(apexes).map((apex) => {
        if (Array.isArray(apex)) {
          return [
            getLengthPixelNumber(apex[0], waveElWidth.value),
            getLengthPixelNumber(apex[1], waveElWidth.value),
          ];
        } else if ("distance" in apex && "height" in apex) {
          return [
            getLengthPixelNumber(apex.distance, waveElWidth.value),
            getLengthPixelNumber(apex.height, waveElWidth.value),
          ];
        }
        console.warn(errorText.apexesFormat);
        return [1, 1];
      });
    }
    function getWaveLength(apexes: Apex[]): number {
      return getApexesPixelNumberArray(apexes).reduce((acc, [d]) => acc + d, 0);
    }
    function getWaveHeight(apexes: Apex[]): number {
      return Math.max(...getApexesPixelNumberArray(apexes).map(([, h]) => h));
    }
    function getRepeatTimes(apexes: Apex[]): number {
      if (!waveElWidth.value) return 0;
      return Math.ceil(waveElWidth.value / getWaveLength(apexes));
    }

    const counter = computed<number>(() => {
      const duration =
        props.apexesSeriesTransformDuration || props.transitionDuration || 500;
      return Math.floor(timestamp.value / duration);
    });
    const apexesSeriesIndex = computed<number>(() => {
      return props.apexesIndex !== undefined
        ? props.apexesIndex
        : counter.value % props.apexesSeries.length;
    });

    const currentApexes = computed<Apex[]>(() => {
      const apexesSeries = props.apexesSeries[apexesSeriesIndex.value];
      if (Array.isArray(apexesSeries)) return apexesSeries;
      else if ("apexes" in apexesSeries) return apexesSeries.apexes;
      throw new Error(errorText.apexesSeriesFormat);
    });
    const currentShape = computed<WaveShape>(() => {
      const apexesSeries = props.apexesSeries[apexesSeriesIndex.value];
      if ("shape" in apexesSeries)
        return apexesSeries.shape || props.shape || "wavy";
      return props.shape || "wavy";
    });
    const currentColor = computed<string | LinearGradientColor>(() => {
      const apexesSeries = props.apexesSeries[apexesSeriesIndex.value];
      if ("color" in apexesSeries) {
        return apexesSeries.color || props.color || "white";
      }
      return props.color || "white";
    });

    const apexesPixelSet = computed<number[][]>(() => {
      return getApexesPixelNumberArray(currentApexes.value);
    });
    const waveLength = computed<number>(() => {
      return getWaveLength(currentApexes.value);
    });
    const waveHeight = computed<number>(() => {
      return getWaveHeight(currentApexes.value);
    });
    const repeatTimes = computed<number>(() => {
      return getRepeatTimes(currentApexes.value);
    });

    watch(
      () => currentApexes.value,
      async (newVal, oldVal) => {
        if (JSON.stringify(newVal) === JSON.stringify(oldVal)) return;
        if (oldVal && newVal.length !== oldVal.length) {
          console.warn(errorText.apexesLengthChanged);
        } else if (getRepeatTimes(oldVal) !== getRepeatTimes(newVal)) {
          console.warn(errorText.apexesTotalDistanceChanged);
        }

        props.onApexesChanged?.(
          [...newVal],
          currentShape.value,
          currentColor.value,
        );
      },
      { deep: true },
    );

    const repeatedApexesPixelSet = computed<number[][]>(() => {
      return Array.from({ length: repeatTimes.value })
        .map((_, i) => {
          if (i === 0) return apexesPixelSet.value;
          return props.repeat
            ? apexesPixelSet.value
            : apexesPixelSet.value.map(([d]) => {
                return [d, 0];
              });
        })
        .flat();
    });

    const wavePath = computed<string>(() => {
      if (!repeatTimes.value) return "";
      return plotter({
        apexesPixelSet: repeatedApexesPixelSet.value,
        totalDistance: waveLength.value * repeatTimes.value * 5,
        waveHeight: waveHeight.value,
        side: props.side,
        shape: currentShape.value,
        smooth: props.smooth,
      });
    });

    const alignItems = computed<string>(() => {
      return props.side === "bottom" ? "flex-start" : "flex-end";
    });
    const transition = computed<string>(() => {
      if (!props.transitionDuration) return "";
      const timing = `${props.transitionDuration}ms linear`;
      const basicTransition = `height ${timing}, margin-top ${timing}, margin-bottom ${timing}`;
      return (
        (isTransition.value ? `width ${timing}, margin-left ${timing}, ` : "") +
        basicTransition
      );
    });

    const containerStyle = computed<StyleValue>(() => {
      const height = `${waveHeight.value}px`;
      return {
        position: "relative",
        display: "flex",
        alignItems: alignItems.value,
        width: props.width + (typeof props.width === "number" ? "px" : ""),
        height,
        marginTop: props.side === "top" ? `-${height}` : "0px",
        marginBottom: props.side === "bottom" ? `-${height}` : "0px",
        transition: transition.value,
        overflow: "hidden",
      };
    });

    const repeatWrapperStyle = computed<StyleValue>(() => {
      const totalWaveLength = waveLength.value * repeatTimes.value * 5;
      return {
        display: "flex",
        alignItems: alignItems.value,
        flexShrink: 0,
        width: `${totalWaveLength}px`,
        maxWidth: `${totalWaveLength}px`,
        height: "100%",
        marginLeft: `-${(totalWaveLength / 5) * 2}px`,
        transition: transition.value,
        overflow: "hidden",
      };
    });

    const svgStyle = computed(() => {
      return {
        flexShrink: 0,
        width: `${waveLength.value * repeatTimes.value * 5}px`,
        height: `${waveHeight.value}px`,
        transition: transition.value,
      };
    });

    const linearGradientStyle = computed(() => {
      return {
        transition: !props.transitionDuration
          ? ""
          : `${props.transitionDuration}ms linear`,
      };
    });

    const stopStyle = computed(() => {
      return {
        transition: !props.transitionDuration
          ? ""
          : `${props.transitionDuration}ms linear`,
      };
    });

    const pathColor = computed<LinearGradientColor>(() => {
      if (typeof currentColor.value === "object") return currentColor.value;
      return {
        name: `vue-surf-${currentColor.value}`,
        steps: [
          { offset: 0, color: currentColor.value, opacity: 1 },
          { offset: 1, color: currentColor.value, opacity: 1 },
        ],
      };
    });

    const pathStyle = computed(() => {
      return {
        fill: `url(#${pathColor.value.name})`,
        transition: !props.transitionDuration
          ? ""
          : `${props.transitionDuration}ms linear`,
      };
    });

    return {
      waveEl,
      waveElWidth,
      repeatTimes,
      containerStyle,
      repeatWrapperStyle,
      svgStyle,
      linearGradientStyle,
      stopStyle,
      pathStyle,
      pathColor,
      wavePath,
    };
  },
  render() {
    const {
      waveElWidth,
      repeatTimes,
      containerStyle,
      repeatWrapperStyle,
      svgStyle,
      linearGradientStyle,
      stopStyle,
      pathStyle,
      pathColor,
      wavePath,
    } = this;

    return h(
      "div",
      { ref: "waveEl", class: "vue-wave", style: containerStyle },
      [
        !!waveElWidth &&
          h(
            "div",
            { class: "vue-wave__repeat-wrapper", style: repeatWrapperStyle },
            [
              repeatTimes > 0 &&
                h(
                  "svg",
                  {
                    xmlns: "http://www.w3.org/2000/svg",
                    viewBox: "0,0,100,100",
                    preserveAspectRatio: "none",
                    style: svgStyle,
                  },
                  [
                    h("defs", [
                      h(
                        "linearGradient",
                        {
                          id: pathColor.name,
                          gradientTransform: `rotate(${
                            pathColor.rotate || 0
                          }, .5, .5)`,
                          style: linearGradientStyle,
                        },
                        [
                          pathColor.steps.length > 0 &&
                            Array.from(pathColor.steps).map(
                              ({ offset, color, opacity }) => {
                                return h("stop", {
                                  offset,
                                  style: {
                                    stopColor: color,
                                    stopOpacity:
                                      opacity === undefined ? 1 : opacity,
                                    ...stopStyle,
                                  },
                                });
                              },
                            ),
                        ],
                      ),
                    ]),
                    wavePath &&
                      Array.from({ length: 5 }).map((_, i) =>
                        h("path", {
                          d: wavePath,
                          "vector-effect": "non-scaling-stroke",
                          style: {
                            ...pathStyle,
                            transform: `translateX(${20 * i}%)`,
                          },
                        }),
                      ),
                  ],
                ),
            ],
          ),
      ],
    );
  },
}) as DefineComponent<WaveProps>;
