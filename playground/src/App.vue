<script setup lang="ts">
import { ref } from "vue";
import { useElementSize } from "@vueuse/core";
import { VueSurf } from "vue-surf";

const sectionRef = ref(null);
const { width } = useElementSize(sectionRef);
</script>

<template>
  <VueSurf
    :width="width"
    :apexes="[
      [0, 50],
      [100, 0],
      [100, 50],
    ]"
    side="top"
    :repeat="false"
    :marquee="false"
  />
  <section ref="sectionRef"></section>
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
