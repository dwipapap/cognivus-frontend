<script setup>
import { computed } from 'vue'
import { VisuallyHidden, DialogTitle, DialogDescription } from 'reka-ui'

const props = defineProps({
  show: { type: Boolean, default: false },
  type: {
    type: String,
    default: 'info',
    validator: (v) => ['success', 'error', 'info', 'warning'].includes(v)
  },
  title: { type: String, default: '' },
  message: { type: String, default: '' },
  persistent: { type: Boolean, default: false },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', 'fullscreen'].includes(v)
  },
  hideFooter: { type: Boolean, default: false },
  confirmLabel: { type: String, default: 'OK' },
  cancelLabel: { type: String, default: 'Cancel' },
  showCancel: { type: Boolean, default: false },
  alert: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'confirm', 'cancel', 'update:show'])

const open = computed({
  get: () => props.show,
  set: (v) => {
    emit('update:show', v)
    if (!v) emit('close')
  }
})

const iconColorClass = computed(() => {
  const classes = {
    success: 'text-brand-success bg-brand-success/10',
    error: 'text-brand-danger bg-brand-danger/10',
    info: 'text-brand-primary bg-brand-primary/10',
    warning: 'text-brand-warning bg-brand-warning/10'
  }
  return classes[props.type]
})

const modalTitle = computed(() => {
  if (props.title) return props.title
  const defaultTitles = {
    success: 'Success',
    error: 'Error',
    info: 'Information',
    warning: 'Warning'
  }
  return defaultTitles[props.type]
})

const sizeMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '5xl': 'max-w-5xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  fullscreen: 'w-[95vw] max-w-none'
}

function onClose() {
  emit('close')
}

function onConfirm() {
  emit('confirm')
}

function onCancel() {
  emit('cancel')
  onClose()
}

const typeIcon = computed(() => {
  const icons = {
    success: 'i-lucide-check-circle',
    error: 'i-lucide-x-circle',
    warning: 'i-lucide-alert-triangle',
    info: 'i-lucide-info'
  }
  return icons[props.type] || icons.info
})
</script>

<template>
  <UModal
    v-model:open="open"
    :title="modalTitle"
    :description="message || undefined"
    :dismissible="!persistent"
    :ui="{
      content: alert ? 'max-w-sm' : sizeMap[size],
      body: { base: message && !$slots.content ? '' : 'p-0' }
    }"
  >
    <template v-if="alert" #content="{ close }">
      <div class="flex flex-col items-center px-8 py-8 gap-4">
        <div v-if="$slots.icon" class="flex-shrink-0">
          <slot name="icon" />
        </div>
        <div
          v-else
          :class="['flex items-center justify-center w-16 h-16 rounded-token-full', iconColorClass]"
        >
          <UIcon :name="typeIcon" class="w-8 h-8" />
        </div>
        <h3 class="text-lg font-bold text-ink text-center">
          {{ modalTitle }}
        </h3>
        <p v-if="message" class="text-sm text-ink-muted text-center leading-relaxed">
          {{ message }}
        </p>
        <UButton
          :label="confirmLabel"
          :color="type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'primary'"
          size="lg"
          class="px-8 rounded-full"
          @click="close()"
        />
      </div>
    </template>

    <template v-if="!alert" #header>
      <div class="flex items-center gap-3 flex-1">
        <div v-if="$slots.icon" class="flex-shrink-0">
          <slot name="icon" />
        </div>
        <div v-else :class="['flex items-center justify-center w-10 h-10 rounded-token-full flex-shrink-0', iconColorClass]">
          <UIcon :name="typeIcon" class="w-5 h-5" />
        </div>
        <h3 class="text-base sm:text-lg font-semibold text-ink truncate flex-1">
          {{ modalTitle }}
        </h3>
        <UButton
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          size="sm"
          @click="onClose"
          aria-label="Close"
        />
      </div>
    </template>

    <template v-if="!alert" #body>
      <VisuallyHidden>
        <DialogTitle>{{ modalTitle }}</DialogTitle>
        <DialogDescription v-if="message">{{ message }}</DialogDescription>
      </VisuallyHidden>
      <slot name="content">
        <p v-if="message" class="text-sm sm:text-base text-ink-muted px-6 py-4">
          {{ message }}
        </p>
      </slot>
    </template>

    <template v-if="!alert && !hideFooter && $slots.footer" #footer>
      <slot name="footer" />
    </template>

    <template v-if="!alert && !hideFooter && !$slots.footer" #footer>
      <div class="flex justify-end gap-2">
        <UButton
          v-if="showCancel"
          :label="cancelLabel"
          color="neutral"
          variant="outline"
          @click="onCancel"
        />
        <UButton
          :label="confirmLabel"
          :color="type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'primary'"
          @click="onConfirm"
        />
      </div>
    </template>
  </UModal>
</template>
