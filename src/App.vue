<script setup lang="ts">
import { ref } from "vue";
import { useElementSize } from "@vueuse/core";
// import { WaveContainer } from "./components/WaveContainer";
import WavePath from "./components/WavePath.vue";

const sectionRef = ref<HTMLElement | null>(null);
const { width } = useElementSize(sectionRef);
</script>

<template>
  <section class="section1">
    <h1>This is Section 1</h1>
  </section>

  <WavePath
    :width="width"
    :color="'white'"
    :poles="[
      [0, 100],
      [100, 0],
      [50, 100],
      [30, 0],
      [100, 200],
      // [150, 0],
      // [100, 100],
      // [100, 0],
      // [100, 100],
    ]"
  />
  <section ref="sectionRef">
    <h1>This is Section 2</h1>
  </section>
</template>

<style scoped lang="scss">
section {
  width: 100vw;
  text-align: center;
  color: black;
  background: white;
  overflow: hidden;

  &.section1 {
    background: lightblue;
  }
}

h1 {
  height: 300px;
  line-height: 300px;
  margin: 0;
}
</style>
