<script setup lang="ts">
import { ref } from "vue";
import { useElementSize } from "@vueuse/core";
import { VueSurf } from "vue-surf";

const sectionRef = ref<HTMLElement | null>(null);
const { width } = useElementSize(sectionRef);

const set = [
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
</script>

<template>
  <section class="section1"></section>

  <VueSurf
    :width="width"
    color="white"
    :poles="set[0]"
    :poles-series="set"
    :smooth="1"
    :marquee="true"
    :marquee-speed="8"
  />

  <section ref="sectionRef"></section>
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
