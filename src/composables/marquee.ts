import { type Ref, ref } from "vue";

export function useMarquee(elementRef: Ref<HTMLElement | null>, speed: number) {
  function standardize(number: number): number {
    return Math.min(Math.max(number, -25), 25);
  }
  const initSpeed = ref<number>(standardize(speed));
  const currentSpeed = ref<number>(standardize(speed));
  const reqFrame = ref<number>(0);
  const offset = ref<number>(0);
  const isStop = ref<boolean>(false);

  function step(): void {
    if (isStop.value) return;
    if (!elementRef.value) {
      throw new Error("[Vue Wave] Element not found");
    }
    if (!(elementRef.value.children[0] instanceof HTMLElement)) {
      throw new Error("[Vue Wave] Element is not HTMLElement");
    }

    const element = elementRef.value.children[0];
    element.style.marginLeft = `calc(-200% + ${offset.value}px)`;
    if (Math.abs(offset.value) > element.clientWidth / 5) offset.value = 0;
    offset.value = offset.value + currentSpeed.value;
    window.requestAnimationFrame(step);
  }

  function startMarquee(): void {
    isStop.value = false;
    reqFrame.value = window.requestAnimationFrame(step);
  }

  function stopMarquee(): void {
    isStop.value = true;
    window.cancelAnimationFrame(reqFrame.value);
  }

  function resetMarqueeSpeed(speed: number) {
    initSpeed.value = standardize(speed);
    currentSpeed.value = standardize(speed);
  }

  function playMarquee(): void {
    if (currentSpeed.value >= initSpeed.value) return;
    const step = initSpeed.value / 200;
    let timer = 0;

    timer = window.setInterval(() => {
      if (currentSpeed.value >= 10) window.clearInterval(timer);
      currentSpeed.value += step;
    }, 1);
  }

  function pauseMarquee(): void {
    if (currentSpeed.value <= 0) return;
    const step = initSpeed.value / 200;
    let timer = 0;

    timer = window.setInterval(() => {
      if (currentSpeed.value <= 0) window.clearInterval(timer);
      currentSpeed.value -= step;
    }, 1);
  }

  return {
    startMarquee,
    resetMarqueeSpeed,
    playMarquee,
    pauseMarquee,
    stopMarquee,
  };
}
