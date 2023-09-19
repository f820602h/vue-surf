<script setup lang="ts">
import { VueSurf } from "../../src/components/VueSurf";
</script>

<template>
  <div>
    <VueSurf
      width="100%"
      :apexes-series="[
        [
          [0, 50],
          [50, 50],
          [50, 50],
        ],
        {
          apexes: [
            [0, 50],
            [50, 0],
            [50, 50],
          ],
          shape: 'serrated',
        },
        [
          [0, 50],
          [50, 50],
          [50, 50],
        ],
        {
          apexes: [
            [0, 50],
            [50, 0],
            [50, 50],
          ],
          shape: 'petal',
        },
      ]"
      :color="'#4F709C'"
      :side="'bottom'"
      :transition-duration="1000"
    />
  </div>
  <div>
    <div class="links" href="">
      <a href="">
        <img class="github" src="./assets/github.svg" alt="github" />
        <p>Vue Surf</p>
      </a>
    </div>
    <h1>Let's go surfing together!</h1>
  </div>
  <div>
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
  </div>
</template>

<style scoped lang="scss">
h1 {
  text-align: center;
  font-size: 45px;
  margin-bottom: 20;
}
.links {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;

  a {
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
  }

  p {
    color: white;
    font-size: 24px;
    font-weight: bold;
    margin-left: 8px;
  }

  img {
    width: 30px;
    height: 30px;
  }
}
section {
  width: 100%;
  height: 200px;
  background: #16222a;
}
</style>
