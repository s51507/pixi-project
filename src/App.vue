<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app" class="min-h-screen">
    <RouterView />
  </div>
</template>

<style>
/* Reset default app styles for cleaner TailwindCSS usage */
#app {
  max-width: none;
  margin: 0;
  padding: 0;
  font-weight: normal;
}

/* Remove default body centering styles */
@media (min-width: 1024px) {
  body {
    display: block;
    place-items: normal;
  }
}
</style>
