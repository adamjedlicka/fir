<template>
  <button @click="base.increment">{{ base.count }}</button>
  <RouterLink to="/">Home</RouterLink>
</template>

<script setup lang="ts">
import { useStore } from '../stores/base'

const base = useStore()

//@ts-ignore
if (import.meta.env.SSR) base.increment()
</script>
