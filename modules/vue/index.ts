import { isRef, toRef, useSSRContext } from 'vue'
import type { Ref } from 'vue'

export const useState = <T>(key: string, init?: () => T | Ref<T>): Ref<T> => {
  const payload = getPayload()

  if (!payload.state) payload.state = {}

  const state = toRef(payload.state, key)

  if (state.value === undefined && init) {
    const initialValue = init()

    if (isRef(initialValue)) {
      // vue will unwrap the ref for us
      payload.state[key] = initialValue
      return initialValue as Ref<T>
    }

    state.value = initialValue
  }

  return state
}

const getPayload = () => {
  // @ts-ignore
  if (import.meta.env.SSR) {
    const ssrContext = useSSRContext()

    return ssrContext.payload
  } else {
    // @ts-ignore
    return window.$payload ?? {}
  }
}
