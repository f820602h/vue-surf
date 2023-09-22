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

  const fps = 60;
  const interval = 1000 / fps;
  let then = 0;
  function draw(timestamp: number): void {
    requestAnimationFrame(draw);

    if (then === undefined) then = timestamp;
    const delta = timestamp - then;

    if (delta > interval) {
      then = timestamp - (delta % interval);

      if (isStop.value) return;
      if (!elementRef.value) return;
      if (!(elementRef.value.children[0] instanceof HTMLElement)) return;

      const element = elementRef.value.children[0];
      element.style.transform = `translateX(${offset.value}px)`;
      if (Math.abs(offset.value) > element.clientWidth / 5) offset.value = 0;
      offset.value = offset.value + currentSpeed.value;
    }
  }

  function start(): void {
    window.clearInterval(resumeTimer.value);
    window.clearInterval(pauseTimer.value);
    isStop.value = false;
    offset.value = 0;
    currentSpeed.value = initSpeed.value;
    reqFrame.value = requestAnimationFrame(draw);
  }

  function stop(): void {
    window.clearInterval(resumeTimer.value);
    window.clearInterval(pauseTimer.value);
    window.cancelAnimationFrame(reqFrame.value);
    isStop.value = true;
    currentSpeed.value = 0;
    reqFrame.value = 0;
  }

  function resetSpeed(speed: number) {
    initSpeed.value = standardize(speed);
    currentSpeed.value = standardize(speed);
  }

  return {
    start,
    resetSpeed,
    stop,
  };
}
