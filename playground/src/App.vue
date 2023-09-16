<script setup lang="ts">
import { ref } from "vue";
import { VueSurf, type WaveExpose } from "../../dist/index";

const sectionRef = ref(null);
const vueSurfRef = ref<WaveExpose | null>(null);

const marquee = ref(false);
</script>

<template>
  <VueSurf
    ref="vueSurfRef"
    width="800px"
    :apexes="[
      [0, 50],
      [100, 0],
      [100, 50],
    ]"
    side="top"
    :marquee="marquee"
    :marquee-speed="10"
  />
  <section
    ref="sectionRef"
    @mouseenter="vueSurfRef?.resumeMarquee()"
    @mouseleave="vueSurfRef?.pauseMarquee()"
  ></section>
</template>

<style scoped lang="scss">
section {
  width: 800px;
  height: 200px;
  text-align: center;
  color: black;
  background: white;
  overflow: hidden;

  &.section1 {
    background: lightblue;
  }
}
</style>
