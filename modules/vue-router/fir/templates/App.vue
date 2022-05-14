<template>
  <Suspense>
    <Layout>
      <RouterView v-slot='{Component, route}'>
        <Suspense>
          <Component :is='Component' :key='route.path' />
        </Suspense>
      </RouterView>
    </Layout>
  </Suspense>
</template>

<script>
import { Layout } from '/pages'

export default {
  components: {
    Layout,
  },
}
</script>