import {
  WaveProps,
  WaveExpose,
  ApexParameters,
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
  nextTick,
  defineComponent,
  TransitionGroup,
  h,
  onBeforeMount,
  onBeforeUnmount,
} from "vue";
import {
  errorText,
  lengthValidator,
  apexesValidator,
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
      validator: lengthValidator,
    },
    shape: {
      type: String as () => WaveShape,
      default: WaveShape.WAVY,
      validator: (val: WaveShape) => {
        if (!val) return true;
        const isValid = Object.values(WaveShape).includes(val);
        if (!isValid) throw new Error(errorText.shape);
        return Object.values(WaveShape).includes(val);
      },
    },
    apexes: {
      type: Array as () => ApexParameters[],
      default: undefined,
      validator: apexesValidator,
    },
    apexesSeries: {
      type: Array as () => (
        | ApexParameters[]
        | { apexes: ApexParameters[]; shape?: WaveShape }
      )[],
      default: undefined,
      validator: (
        val: (
          | ApexParameters[]
          | { apexes: ApexParameters[]; shape?: WaveShape }
        )[],
      ) => {
        if (!val) return true;
        if (!Array.isArray(val) || (Array.isArray(val) && val.length === 0)) {
          throw new Error(errorText.apexesSeriesFormat);
        }
        return val.every((apexes) => {
          if (Array.isArray(apexes)) {
            return apexesValidator(apexes);
          } else if ("apexes" in apexes) {
            if ("shape" in apexes && !!apexes.shape) {
              const isValid = Object.values(WaveShape).includes(apexes.shape);
              if (!isValid) throw new Error(errorText.shape);
            }
            return apexesValidator(apexes.apexes);
          }
          return false;
        });
      },
    },
    side: {
      type: String as () => WaveSide,
      default: WaveSide.TOP,
      validator: (val: WaveSide) => {
        if (!val) return true;
        const isValid = Object.values(WaveSide).includes(val);
        if (!isValid) throw new Error(errorText.side);
        return Object.values(WaveSide).includes(val);
      },
    },
    color: {
      type: [String, Object] as PropType<string | LinearGradientColor>,
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
      type: Function as PropType<ApexesChangedCallback>,
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
    watch(() => props.marqueeSpeed, resetMarqueeSpeed);
    watch(
      () => waveElWidth.value && props.marquee,
      (val) => {
        if (!val) nextTick(() => stopMarquee());
        else nextTick(() => startMarquee());
      },
      { immediate: true },
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
    const duration = computed<number>(() => {
      return (
        props.apexesSeriesTransformDuration || props.transitionDuration || 500
      );
    });
    const counter = computed<number>(() => {
      return Math.floor(timestamp.value / duration.value);
    });
    const apexesSeriesIndex = computed<number>(() => {
      if (!props.apexesSeries) return 0;
      return counter.value % props.apexesSeries.length;
    });
    const currentShape = computed<WaveShape>(() => {
      if (props.apexesSeries && props.apexesSeries.length > 0) {
        const apexesSeries = props.apexesSeries[apexesSeriesIndex.value];
        if ("shape" in apexesSeries) {
          return apexesSeries.shape || props.shape || WaveShape.WAVY;
        }
      }
      return props.shape || WaveShape.WAVY;
    });
    const currentApexes = computed<ApexParameters[]>(() => {
      if (props.apexesSeries && props.apexesSeries.length > 0) {
        const apexesSeries = props.apexesSeries[apexesSeriesIndex.value];
        if (Array.isArray(apexesSeries)) return apexesSeries;
        else if ("apexes" in apexesSeries) return apexesSeries.apexes;
        throw new Error(errorText.apexesSeriesFormat);
      } else if (props.apexes) return props.apexes;
      throw new Error(errorText.apexesNotProvide);
    });

    watch(
      () => props.apexesSeries,
      (val) => {
        if (val) {
          resumeApexesSeriesTransform();
          timestamp.value += duration.value * 0.9;
        } else pauseApexesSeriesTransform();
      },
      { immediate: true },
    );
    watch(
      () => currentApexes.value,
      async (newVal, oldVal) => {
        if (oldVal && newVal.length !== oldVal.length) {
          console.warn(errorText.apexesLengthChanged);
        }
        props.onApexesChanged?.([...newVal], currentShape.value);
      },
    );

    const isTransition = ref<boolean>(true);
    function debounce(func: () => void) {
      let timer = 0;
      return function () {
        if (timer) clearTimeout(timer);
        timer = window.setTimeout(func, 100);
      };
    }

    function transitionToggle() {
      pauseApexesSeriesTransform();
      stopMarquee();
      isTransition.value = false;
      resetTransition();
    }
    const resetTransition = debounce(() => {
      isTransition.value = true;
      if (props.marquee) startMarquee();
      if (props.apexesSeries) resumeApexesSeriesTransform();
    });
    onBeforeMount(() => {
      window.addEventListener("resize", transitionToggle);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("resize", transitionToggle);
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

    const closureApexes = computed<ApexParameters[]>(() => {
      if (!props.closure) return currentApexes.value;
      const resultApexes = [...currentApexes.value];
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
    });

    const apexesPixelNumberArray = computed<number[][]>(() => {
      return closureApexes.value.map((apex) => {
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
        } else {
          throw new Error(
            `[Vue Surf] Invalid apex format ${JSON.stringify(apex)}`,
          );
        }
      });
    });

    const waveHeight = computed<number>(() => {
      return Math.max(...apexesPixelNumberArray.value.map(([, h]) => h));
    });

    const waveLength = computed<number>(() => {
      return apexesPixelNumberArray.value.reduce((acc, [d]) => acc + d, 0);
    });

    const repeatTimes = computed<number>(() => {
      if (!waveElWidth.value) return 0;
      return Math.ceil(waveElWidth.value / waveLength.value);
    });

    function getHeightPercent(h: number) {
      const height = props.side === "bottom" ? h : waveHeight.value - h;
      return getLengthPercentNumber(height, waveHeight.value);
    }

    function getDistancePercent(d: number) {
      return getLengthPercentNumber(d, waveLength.value);
    }

    const wavePath = computed<string>(() => {
      const origin = props.side === "bottom" ? "-0.1" : "100.1";

      let sumDistance = 0;
      let path = "";

      path += apexesPixelNumberArray.value.reduce((acc, [d, h], index, arr) => {
        const halfBetweenPrev = average(d, 0);
        const apexSvgXPercent = getDistancePercent(sumDistance + d);
        const apexSvgYPercent = getHeightPercent(h);

        if (index === 0) {
          return (acc += `${apexSvgYPercent}`);
        } else {
          const prevApexSvgXPercent = getDistancePercent(sumDistance);
          const prevApexSvgYPercent = getHeightPercent(arr[index - 1][1]);

          let smoothness = 0;
          if (index !== arr.length - 1 && index !== 1) {
            const halfBetweenNext = average(arr[index + 1][0], 0);

            const prev = halfBetweenPrev;
            const next = halfBetweenNext;
            if (prev < next) {
              const ratio = (prev + next) / next;
              smoothness = props.smooth ? ratio * prev * smoothRatio.value : 0;
            }
          }

          const middleBetweenPrevSvgX = sumDistance + halfBetweenPrev;

          let firstControlPointX;
          switch (currentShape.value) {
            case WaveShape.WAVY:
              firstControlPointX = getDistancePercent(
                middleBetweenPrevSvgX + smoothness,
              );
              break;
            case WaveShape.SERRATED:
              firstControlPointX = prevApexSvgXPercent;
              break;

            case WaveShape.PETAL:
              firstControlPointX =
                h < arr[index - 1][1] ? apexSvgXPercent : prevApexSvgXPercent;
              break;
            default:
              firstControlPointX = getDistancePercent(
                middleBetweenPrevSvgX + smoothness,
              );
          }

          let firstControlPointY;
          switch (currentShape.value) {
            case WaveShape.WAVY:
              firstControlPointY = prevApexSvgYPercent;
              break;
            case WaveShape.SERRATED:
              firstControlPointY = prevApexSvgYPercent;
              break;
            case WaveShape.PETAL:
              firstControlPointY =
                h < arr[index - 1][1] ? prevApexSvgYPercent : apexSvgYPercent;
              break;
            default:
              firstControlPointY = prevApexSvgYPercent;
          }

          let secondControlPointX;
          switch (currentShape.value) {
            case WaveShape.WAVY:
              secondControlPointX = getDistancePercent(
                middleBetweenPrevSvgX - smoothness,
              );
              break;
            case WaveShape.SERRATED:
              secondControlPointX = apexSvgXPercent;
              break;
            case WaveShape.PETAL:
              secondControlPointX = apexSvgXPercent;
              break;
            default:
              secondControlPointX = getDistancePercent(
                middleBetweenPrevSvgX - smoothness,
              );
          }

          let secondControlPointY;
          switch (currentShape.value) {
            case WaveShape.WAVY:
              secondControlPointY = apexSvgYPercent;
              break;
            case WaveShape.SERRATED:
              secondControlPointY = apexSvgYPercent;
              break;
            case WaveShape.PETAL:
              secondControlPointY = apexSvgYPercent;
              break;
            default:
              secondControlPointY = apexSvgYPercent;
          }

          const firstControlPoint = `${firstControlPointX} ${firstControlPointY}`;
          const secondControlPoint = `${secondControlPointX} ${secondControlPointY}`;
          const end = `${apexSvgXPercent} ${apexSvgYPercent}`;

          sumDistance += d;

          return (acc += ` C${firstControlPoint}, ${secondControlPoint}, ${end}`);
        }
      }, "");

      return `M0 ${origin} L0 ${path} L100 ${origin}Z`;
    });

    const pathColor = computed<string>(() => {
      if (typeof props.color === "string") return props.color;
      return `url(#gradient-${props.color.name})`;
    });
    const alignItems = computed<string>(() => {
      return props.side === "bottom" ? "flex-start" : "flex-end";
    });
    const transition = computed<string>(() => {
      if (!props.transitionDuration || !isTransition.value) return "";
      return `width ${props.transitionDuration}ms linear, height ${props.transitionDuration}ms linear, margin ${props.transitionDuration}ms linear`;
    });

    const containerStyle = computed<StyleValue>(() => {
      const height = `${waveHeight.value}px`;
      return {
        position: "relative",
        display: "flex",
        alignItems: alignItems.value,
        width: props.width + typeof props.width === "number" ? "px" : "",
        height,
        marginTop: props.side === "top" ? `-${height}` : "0px",
        marginBottom: props.side === "bottom" ? `-${height}` : "0px",
        transition: transition.value,
        overflow: "hidden",
      };
    });

    const repeatWrapperStyle = computed<StyleValue>(() => {
      const totalWaveLength = waveLength.value * repeatTimes.value;
      return {
        display: "flex",
        alignItems: alignItems.value,
        flexShrink: 0,
        width: `${totalWaveLength * 5}px`,
        maxWidth: `${totalWaveLength * 5}px`,
        height: "100%",
        marginLeft: props.marquee ? `-200%` : "",
        transition: transition.value,
        overflow: "hidden",
      };
    });

    const svgStyle = computed(() => {
      return {
        flexShrink: 0,
        width: `${waveLength.value}px`,
        height: `${waveHeight.value}px`,
        transition: transition.value,
      };
    });

    const pathStyle = computed(() => {
      return {
        fill: pathColor.value,
        transition: isTransition.value
          ? `${props.transitionDuration}ms linear`
          : "",
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
      isRepeat: props.repeat,
      repeatTimes,
      wavePath,
      containerStyle,
      repeatWrapperStyle,
      svgStyle,
      pathStyle,
      colorProp: props.color,
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
      colorProp,
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
                        typeof colorProp !== "string" &&
                          h("defs", [
                            h(
                              "linearGradient",
                              {
                                id: `gradient-${colorProp.name}`,
                                gradientTransform: `rotate(${
                                  colorProp.rotate || 0
                                })`,
                              },
                              [
                                colorProp.steps.length > 0 &&
                                  Array.from(colorProp.steps).map(
                                    (colorStep) => {
                                      return h("stop", {
                                        offset: colorStep.offset,
                                        style: {
                                          stopColor: colorStep.color,
                                          stopOpacity: colorStep.opacity,
                                        },
                                      });
                                    },
                                  ),
                              ],
                            ),
                          ]),
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
