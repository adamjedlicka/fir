import { isRef, reactive, toRef, useSSRContext } from 'vue'
import type { Ref } from 'vue'

let _reactiveState = null

export const useState = <T>(key: string, init?: () => T | Ref<T>): Ref<T> => {
  let _state

  //@ts-ignore
  if (import.meta.env.SSR) {
    const ssrContext = useSSRContext()

    if (!ssrContext.payload.state) ssrContext.payload.state = reactive({})

    _state = ssrContext.payload.state
  } else {
    if (!_reactiveState) {
      //@ts-ignore
      _reactiveState = reactive(window.$payload.state ?? {})
    }

    _state = _reactiveState
  }

  const state = toRef(_state, key)

  if (state.value === undefined && init) {
    const initialValue = init()

    if (isRef(initialValue)) {
      // vue will unwrap the ref for us
      _state[key] = initialValue
      return initialValue as Ref<T>
    }

    state.value = initialValue
  }

  return state
}
