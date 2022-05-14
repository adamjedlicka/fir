<template>
  <slot />
</template>

<script setup lang="ts">
//@ts-ignore
import * as stores from '/stores.js'

//@ts-ignore
if (import.meta.env.SSR) {
  const loaders = []

  for (const { useStore, serverInit } of Object.values(stores) as any) {
    const store = useStore()
    loaders.push(serverInit().then((data) => store.$patch(data)))
  }

  await Promise.all(loaders)
}
</script>
