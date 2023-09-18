<script setup lang="ts">
import { VueSurf } from "../../dist/index";
</script>

<template>
  <VueSurf
    width="100%"
    :apexes-series="[
      [
        [0, 50],
        ['45%', 150],
        ['55%', 50],
      ],
      [
        [0, 170],
        ['50%', 80],
        ['50%', 170],
      ],
      [
        [0, 90],
        ['35%', 140],
        ['65%', 90],
      ],
    ]"
    :color="{
      name: 'linear-gradient-0',
      rotate: 90,
      steps: [
        { offset: 0, color: '#26D0CE', opacity: 0.3 },
        { offset: 1, color: '#1A2980' },
      ],
    }"
    :transition-duration="1500"
  />
  <VueSurf
    width="100%"
    :apexes-series="[
      [
        [0, 75],
        ['65%', 0],
        ['35%', 120],
      ],
      [
        [0, 0],
        ['50%', 70],
        ['50%', 10],
      ],
      [
        [0, 120],
        ['25%', 0],
        ['75%', 200],
      ],
    ]"
    :color="{
      name: 'linear-gradient-1',
      rotate: 90,
      steps: [
        { offset: 0, color: '#4b6cb7', opacity: 0.8 },
        { offset: 1, color: '#182848' },
      ],
    }"
    :closure="false"
    :marquee="false"
    :transition-duration="1500"
  />
  <VueSurf
    width="100%"
    :apexes="[
      [0, 50],
      ['40%', 0],
      ['60%', 100],
    ]"
    :color="{
      name: 'linear-gradient-2',
      rotate: 90,
      steps: [
        { offset: 0, color: '#16222a', opacity: 0.8 },
        { offset: 1, color: '#16222a' },
      ],
    }"
    :closure="false"
    :marquee="false"
    :transition-duration="0"
  />
  <section></section>
</template>

<style scoped lang="scss">
section {
  width: 100%;
  height: 200px;
  background: #16222a;
}
</style>
