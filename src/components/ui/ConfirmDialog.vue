<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Confirm Action' },
  message: { type: String, default: 'Are you sure you want to proceed?' },
  confirmText: { type: String, default: 'Confirm' },
  cancelText: { type: String, default: 'Cancel' },
  variant: {
    type: String,
    default: 'danger',
    validator: (v) => ['danger', 'warning', 'info'].includes(v)
  },
  persistent: { type: Boolean, default: false }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

const open = computed({
  get: () => props.show,
  set: (v) => emit('update:modelValue', v)
})

const confirmColor = computed(() => {
  const map = { danger: 'error', warning: 'warning', info: 'primary' }
  return map[props.variant]
})

function onConfirm() {
  emit('confirm')
  open.value = false
}

function onCancel() {
  emit('cancel')
  open.value = false
}

function onClose() {
  emit('close')
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" :title="title" :description="message" :prevent-close="persistent" @close="onClose">
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton :label="cancelText" color="neutral" variant="outline" @click="onCancel" />
        <UButton :label="confirmText" :color="confirmColor" @click="onConfirm" />
      </div>
    </template>
  </UModal>
</template>
