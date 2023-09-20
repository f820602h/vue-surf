import { ref } from "vue";

export function useTransformation() {
  const reqFrame = ref<number>(0);
  const stamp = ref<number>(0);

  const fps = 60;
  const interval = 1000 / fps;
  let then = 0;
  function draw(timestamp: number) {
    requestAnimationFrame(draw);

    if (then === undefined) then = timestamp;
    const delta = timestamp - then;

    if (delta > interval) {
      then = timestamp - (delta % interval);
      stamp.value = timestamp;
    }
  }

  function resume(): void {
    reqFrame.value = requestAnimationFrame(draw);
  }

  function pause(): void {
    reqFrame.value = 0;
  }

  return {
    stamp,
    pause,
    resume,
  };
}
