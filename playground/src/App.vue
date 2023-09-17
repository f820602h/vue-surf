<script setup lang="ts">
import { VueSurf } from "../../dist/index";
</script>

<template>
  <VueSurf
    width="800px"
    :apexes="[
      [0, 50],
      [50, 0],
      [50, 50],
    ]"
  />
  <section></section>
</template>

<style scoped lang="scss">
section {
  width: 800px;
  height: 200px;
  background: white;
}
</style>
