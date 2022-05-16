<template>
  <StoreProvider>
    <slot />
  </StoreProvider>
</template>

<script setup lang="ts">
import StoreProvider from '@fir-js/vue-pinia/components/StoreProvider.vue'
</script>
