import { Ref, ref } from "vue";

export function useMarquee(elementRef: Ref<HTMLElement | null>, speed = 0) {
  const initOffset = Math.min(2 + speed, 10);

  const clone = ref<string>("");
  const isStart = ref<number>(0);
  const offset = ref<number>(initOffset);
  const reqFrame = ref<number>(0);

  const resetting = ref<boolean>(false);

  function marquee() {
    if (!elementRef.value) throw new Error("Element not found");
    clone.value = elementRef.value.innerHTML;
    const firstElement = elementRef.value.children[0];
    let i = 0;
    elementRef.value.insertAdjacentHTML("beforeend", clone.value);
    elementRef.value.insertAdjacentHTML("beforeend", clone.value);

    function step(timestamp: number) {
      if (!isStart.value) isStart.value = timestamp;
      if (firstElement instanceof HTMLElement) {
        firstElement.style.marginLeft = `-${i}px`;
      }

      if (i > firstElement.clientWidth) i = 0;
      i = i + offset.value;
      window.requestAnimationFrame(step);
    }

    reqFrame.value = window.requestAnimationFrame(step);
  }

  function reset() {
    if (resetting.value) return;
    resetting.value = true;

    window.cancelAnimationFrame(reqFrame.value);
    if (!elementRef.value) throw new Error("Element not found");
    elementRef.value.innerHTML = clone.value;
    marquee();

    window.setTimeout(() => {
      resetting.value = false;
    }, 300);
  }

  function stop() {
    if (offset.value <= 0) return;
    const step = initOffset / 200;
    let timer = 0;

    timer = window.setInterval(() => {
      if (offset.value <= 0) window.clearInterval(timer);
      offset.value -= step;
    }, 1);
  }

  function start() {
    if (offset.value >= initOffset) return;
    const step = initOffset / 200;
    let timer = 0;

    timer = window.setInterval(() => {
      if (offset.value >= 10) window.clearInterval(timer);
      offset.value += step;
    }, 1);
  }

  return {
    marquee,
    reset,
    start,
    stop,
  };
}
