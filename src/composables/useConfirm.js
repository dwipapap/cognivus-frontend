import { ref } from 'vue'

export function useConfirm() {
  const open = ref(false)
  const resolveCallback = ref(null)
  const message = ref('')

  function confirm(msg) {
    message.value = msg
    open.value = true
    return new Promise((resolve) => {
      resolveCallback.value = resolve
    })
  }

  function onConfirm() { open.value = false; resolveCallback.value?.(true) }
  function onCancel() { open.value = false; resolveCallback.value?.(false) }

  return { open, message, confirm, onConfirm, onCancel }
}
