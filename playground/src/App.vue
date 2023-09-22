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
          [50, 0],
          [50, 50],
        ],
        {
          apexes: [
            [0, 50],
            [50, 0],
            [50, 50],
          ],
          color: '#419197',
          shape: 'serrated',
        },
        [
          [0, 50],
          [50, 0],
          [50, 50],
        ],
        {
          apexes: [
            [0, 50],
            [50, 0],
            [50, 50],
          ],
          color: '#12486B',
          shape: 'petal',
        },
      ]"
      :color="'#4F709C'"
      :side="'bottom'"
      :transition-duration="1000"
    />
  </div>

  <div class="title">
    <div class="name">
      <img class="github" src="./assets/github.svg" alt="github" />
      <p>Vue Surf</p>
    </div>
    <h1>Let's go surfing together!</h1>
    <pre>$ npm i vue-surf</pre>
    <a href="https://github.com/f820602h/vue-surf"> → Home Page</a>
  </div>

  <div>
    <VueSurf
      width="100%"
      :apexes-series="[
        [
          [0, 70],
          ['45%', 100],
          ['55%', 80],
        ],
        [
          [0, 90],
          ['50%', 50],
          ['50%', 120],
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
      :smooth="false"
      :marquee-speed="4"
      :transition-duration="2000"
    />
    <VueSurf
      width="100%"
      :apexes-series="[
        [
          [0, 40],
          ['50%', 70],
          ['50%', 30],
        ],
        [
          [0, 85],
          ['65%', 30],
          ['35%', 60],
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
      :smooth="false"
      :marquee-speed="4.5"
      :transition-duration="1500"
    />
    <VueSurf
      width="100%"
      :apexes-series="[
        [
          [0, 25],
          ['35%', 0],
          ['65%', 60],
        ],
      ]"
      :color="{
        name: 'linear-gradient-2',
        rotate: 90,
        steps: [
          { offset: 0, color: '#16222a', opacity: 0.8 },
          { offset: 1, color: '#16222a' },
        ],
      }"
      :smooth="false"
      :closure="false"
      :marquee="false"
      :transition-duration="0"
    />
    <section></section>
  </div>
</template>

<style scoped lang="scss">
.title {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;

  .name {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: -50px auto 0 auto;

    p {
      font-size: 24px;
      font-weight: bold;
      margin: 0 0 0 8px;
    }

    img {
      width: 30px;
      height: 30px;
    }
  }

  h1 {
    text-align: center;
    font-size: 45px;
    margin: 4px 0 0 0;
    line-height: 1;
  }

  pre {
    margin: 32px 0;
    padding: 4px 8px;
    border-radius: 4px;
    background: #444;
  }

  a {
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px white solid;
    font-size: 16px;
    font-style: italic;
    font-weight: bold;
    text-decoration: none;
    color: white;
  }
}

section {
  width: 100%;
  height: 5vh;
  background: #16222a;
}
</style>
