<template>
  <h1>Hello, Fir!</h1>
  <button @click="count++">Count: {{ count }}</button>
  <RouterLink to="/a">A</RouterLink>
</template>

<script setup lang="ts">
import { useState } from '@fir-js/vue/index'

const count = useState('count', () => Math.round(Math.random() * 1000))
</script>
