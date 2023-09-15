<script setup lang="ts">
import { ref } from "vue";
import type { WaveExpose, PoleParameters } from "./types";
import { useElementSize } from "@vueuse/core";
import WavePath from "./components/WavePath.vue";

const wave = ref<WaveExpose>();
const sectionRef = ref<HTMLElement | null>(null);
const { width } = useElementSize(sectionRef);

const set: PoleParameters[][] = [
  [
    [0, 100],
    [300, 0],
    [300, 100],
  ],
  [
    [0, 0],
    [300, 100],
    [300, 0],
  ],
  [
    [0, 0],
    [300, 200],
    [300, 0],
  ],
];

const index = ref(0);
const marquee = ref(true);

function changeIndex() {
  index.value = index.value === 0 ? 1 : 0;
}
</script>

<template>
  <section class="section1"></section>

  <WavePath
    ref="wave"
    :width="width"
    side="bottom"
    color="lightblue"
    :poles-series="set"
    :smooth="1"
    :marquee="marquee"
    :marquee-speed="8"
  />
  <section
    ref="sectionRef"
    @click="changeIndex"
    @mouseenter="wave?.pausePolesSeriesTransform"
    @mouseleave="wave?.playPolesSeriesTransform"
  ></section>
</template>

<style scoped lang="scss">
section {
  width: 100vw;
  height: 300px;
  text-align: center;
  color: black;
  background: white;
  overflow: hidden;

  &.section1 {
    background: lightblue;
  }
}
</style>
