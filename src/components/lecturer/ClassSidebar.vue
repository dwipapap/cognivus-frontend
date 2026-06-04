<script setup>
import { computed } from 'vue';

const props = defineProps({
  classes: {
    type: Array,
    required: true
  },
  selectedClass: {
    type: Object,
    default: null
  },
  levels: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['select']);

const getLevelName = (levelid) => {
  const level = props.levels.find(l => l.levelid === levelid);
  return level?.name || '-';
};
</script>

<template>
  <div class="bg-white rounded-lg border border-gray-100 shadow-sm p-4 sticky top-6">
    <h2 class="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3 px-1">Classes</h2>
    
    <div class="space-y-1 max-h-[75vh] overflow-y-auto pr-1">
      <button
        v-for="cls in classes"
        :key="cls.classid"
        @click="emit('select', cls)"
        :class="[
          'w-full text-left group relative p-3 rounded-lg transition-all duration-200 border',
          selectedClass?.classid === cls.classid
            ? 'bg-blue-50/80 border-blue-200 ring-1 ring-blue-600/20'
            : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
        ]"
      >
        <span class="block text-[9px] font-bold text-blue-600/70 uppercase tracking-wider mb-0.5">
          {{ getLevelName(cls.levelid) }}
        </span>
        <h3 class="font-semibold text-sm text-gray-900 truncate leading-tight">{{ cls.class_code }}</h3>
      </button>
    </div>
  </div>
</template>
