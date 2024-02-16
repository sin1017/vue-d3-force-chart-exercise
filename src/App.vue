<script setup lang="ts">
import HomeView from "./views/HomeView.vue";
const nodeList = [
  { id: 5, name: "亮", color: "#7777a9" },
  { id: 6, name: "丽", color: "#77A9A7" },
  { id: 9, name: "组长", color: "#77A982" },
  { id: 12, name: "湖南邵阳", color: "#7777a9" },
];
const lineData = [
  {
    id: 1,
    source: 12,
    target: 5,
    relation: "籍贯",
    value: 1.3,
  },
  {
    id: 2,
    source: 9,
    target: 6,
    relation: "舍友",
    value: 1,
  },
];
</script>

<template>
  <HomeView
    :data="{
      nodeList: nodeList,
      lineData: lineData,
    }"
  />
</template>
