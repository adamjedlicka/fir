<template>
  <h1>Hello, Fir!</h1>
  <button @click="count++">{{ t('Count: {0}', [count]) }}</button>
  <RouterLink to="/a">A</RouterLink>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useState } from '@fir-js/vue/index'

const { t } = useI18n()

const count = useState('count', () => Math.round(Math.random() * 1000))

//@ts-ignore
if (import.meta.env.SSR) count.value += 9000
</script>

<i18n lang="yaml">
en:
  'Count: {0}': 'Počet: {0}'
</i18n>
