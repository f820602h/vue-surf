<script setup lang="ts">
import { ref } from "vue";
import type { PoleParameters } from "./types";
import { useElementSize } from "@vueuse/core";
import WavePath from "./components/WavePath.vue";

const sectionRef = ref<HTMLElement | null>(null);
const { width } = useElementSize(sectionRef);

const set: PoleParameters[][] = [
  [
    [0, 100],
    [100, 0],
    [100, 100],
    [100, 0],
    [100, 100],
  ],
  [
    [0, 0],
    [150, 150],
    [100, 0],
    [200, 100],
    [50, 0],
  ],
];

const index = ref(0);

function changeIndex() {
  index.value = index.value === 0 ? 1 : 0;
}
</script>

<template>
  <section class="section1"></section>

  <WavePath :width="width" :color="'white'" :poles="set[index]" :smooth="1" />
  <section ref="sectionRef" @click="changeIndex"></section>
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
