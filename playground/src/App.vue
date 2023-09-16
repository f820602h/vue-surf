<script setup lang="ts">
import { ref } from "vue";
import { useElementSize } from "@vueuse/core";
import { VueSurf, type WaveExpose } from "vue-surf";
import { StarportCarrier } from "vue-starport";

const sectionRef = ref(null);
const vueSurfRef = ref<WaveExpose | null>(null);
const { width } = useElementSize(sectionRef);
</script>

<template>
  <StarportCarrier />
  <VueSurf
    ref="vueSurfRef"
    :width="width"
    :apexes="[
      [0, 50],
      [100, 0],
      [100, 50],
    ]"
    side="top"
    :marquee-speed="-5"
  />
  <section
    ref="sectionRef"
    @mouseenter="vueSurfRef?.pauseMarquee()"
    @mouseleave="vueSurfRef?.playMarquee()"
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
