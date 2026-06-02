<script setup>
import { externalLinks } from '../../config/external-links'

const getBgColor = (color) => {
  const colors = {
    emerald: 'bg-emerald-100 hover:bg-emerald-200',
    blue: 'bg-blue-100 hover:bg-blue-200',
    red: 'bg-red-100 hover:bg-red-200',
    green: 'bg-green-100 hover:bg-green-200',
    yellow: 'bg-yellow-100 hover:bg-yellow-200',
    orange: 'bg-orange-100 hover:bg-orange-200',
    purple: 'bg-purple-100 hover:bg-purple-200',
    gray: 'bg-muted hover:bg-accented'
  }
  return colors[color] || 'bg-muted hover:bg-accented'
}

const getIconColor = (color) => {
  const colors = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    red: 'text-red-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    orange: 'text-orange-600',
    purple: 'text-purple-600',
    gray: 'text-toned'
  }
  return colors[color] || 'text-toned'
}
</script>

<template>
  <div>
    <div class="mb-6">
            <h1 class="text-3xl font-bold text-default">External Links</h1>
            <p class="text-muted mt-1">Quick access to external services and tools</p>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <a v-for="link in externalLinks" :key="link.name" :href="link.url" target="_blank" rel="noopener noreferrer"
                :class="[getBgColor(link.color), 'group rounded-xl p-6 transition-colors border border-transparent hover:border-default']">
        <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-4', getIconColor(link.color)]">
          <UIcon :name="link.icon" class="w-8 h-8" />
        </div>

                <h3 class="font-semibold text-default group-hover:text-default">{{ link.name }}</h3>
                <p class="text-xs text-muted mt-1">{{ link.description }}</p>

                <!-- External icon indicator -->
                <div class="mt-3 flex items-center text-xs text-muted">
          <UIcon name="i-lucide-external-link" class="w-3 h-3 mr-1" />
          Open
        </div>
      </a>
    </div>

        <div class="mt-8 p-4 bg-elevated rounded-xl">
            <p class="text-sm text-muted">
                <span class="font-medium text-default">Tip:</span>
                All links open in a new tab. Edit the links in <code
                    class="bg-accented px-1.5 py-0.5 rounded text-xs">ExternalLinks.vue</code> to customize.
            </p>
        </div>
  </div>
</template>
