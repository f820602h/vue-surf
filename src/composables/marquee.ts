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

  const resumeTimer = ref<number>(0);
  const pauseTimer = ref<number>(0);

  function step(): void {
    if (isStop.value) return;
    if (!elementRef.value) return;
    if (!(elementRef.value.children[0] instanceof HTMLElement)) return;

    const element = elementRef.value.children[0];
    element.style.marginLeft = `calc(-200% + ${offset.value}px)`;
    if (Math.abs(offset.value) > element.clientWidth / 5) offset.value = 0;
    offset.value = offset.value + currentSpeed.value;
    window.requestAnimationFrame(step);
  }

  function startMarquee(): void {
    window.clearInterval(resumeTimer.value);
    window.clearInterval(pauseTimer.value);
    isStop.value = false;
    currentSpeed.value = initSpeed.value;
    reqFrame.value = window.requestAnimationFrame(step);
  }

  function stopMarquee(): void {
    window.clearInterval(resumeTimer.value);
    window.clearInterval(pauseTimer.value);
    window.cancelAnimationFrame(reqFrame.value);
    isStop.value = true;
    currentSpeed.value = 0;
    reqFrame.value = 0;
  }

  function resetMarqueeSpeed(speed: number) {
    initSpeed.value = standardize(speed);
    currentSpeed.value = standardize(speed);
  }

  function resumeMarquee(): void {
    if (isStop.value) return;
    if (!initSpeed.value) return;
    if (Math.abs(currentSpeed.value) >= Math.abs(initSpeed.value)) return;
    if (resumeTimer.value) window.clearInterval(resumeTimer.value);
    if (pauseTimer.value) window.clearInterval(pauseTimer.value);

    const stepSpeed = initSpeed.value < 0 ? -0.1 : 0.1;

    resumeTimer.value = window.setInterval(() => {
      if (Math.abs(currentSpeed.value) >= Math.abs(initSpeed.value)) {
        currentSpeed.value = initSpeed.value;
        window.clearInterval(resumeTimer.value);
      } else currentSpeed.value = standardize(currentSpeed.value + stepSpeed);
    }, 10);
  }

  function pauseMarquee(): void {
    if (isStop.value) return;
    if (!initSpeed.value) return;
    if (
      (initSpeed.value > 0 && currentSpeed.value <= 0) ||
      (initSpeed.value < 0 && currentSpeed.value >= 0)
    ) {
      return;
    }
    if (resumeTimer.value) window.clearInterval(resumeTimer.value);
    if (pauseTimer.value) window.clearInterval(pauseTimer.value);

    const stepSpeed = initSpeed.value < 0 ? -0.1 : 0.1;

    pauseTimer.value = window.setInterval(() => {
      if (
        (initSpeed.value > 0 && currentSpeed.value <= 0) ||
        (initSpeed.value < 0 && currentSpeed.value >= 0)
      ) {
        currentSpeed.value = 0;
        window.clearInterval(pauseTimer.value);
      } else currentSpeed.value = standardize(currentSpeed.value - stepSpeed);
    }, 10);
  }

  return {
    startMarquee,
    resetMarqueeSpeed,
    resumeMarquee,
    pauseMarquee,
    stopMarquee,
  };
}
