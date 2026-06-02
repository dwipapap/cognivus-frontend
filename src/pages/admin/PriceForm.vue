<script setup>
import { watch, computed } from 'vue';
import { useForm } from '../../composables/useForm';


const props = defineProps({
  priceItem: {
    type: Object,
    default: null
  },
  isEditMode: {
    type: Boolean,
    default: false
  },
  levels: {
    type: Array,
    default: () => []
  },
  programs: {
    type: Array,
    default: () => []
  },
  prices: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'save']);

const { formData, errors, isSubmitting, submit, getFieldProps, reset } = useForm(
  {},
  {
    levelid: [],
    programid: [],
    name: [],
    description: [],
    harga: ['required'],
    monthlyprice: []
  }
);

watch(() => props.priceItem, (newVal) => {
  if (newVal) {
    formData.levelid = newVal.levelid ? Number(newVal.levelid) : '';
    formData.programid = newVal.programid ? Number(newVal.programid) : '';
    formData.name = newVal.name || '';
    formData.description = newVal.description || '';
    formData.harga = newVal.harga || '';
    formData.monthlyprice = newVal.monthlyprice || '';
  } else {
    reset();
  }
}, { immediate: true });

const isDuplicateCombination = computed(() => {
  if (!formData.levelid || !formData.programid) return false;

  return props.prices.some(price => {
    if (props.isEditMode && price.priceid === props.priceItem?.priceid) {
      return false;
    }
    return price.levelid === Number(formData.levelid) &&
           price.programid === Number(formData.programid);
  });
});

const formatIDR = (value) => {
  if (!value) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
};

const handleSave = async () => {
  await submit(async (data) => {
    emit('save', data);
  });
};
</script>

<template>
  <form @submit.prevent="handleSave" class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-6">
        <div class="bg-default rounded-lg p-6 border border-default">
          <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-tag" class="w-4 h-4 text-toned" />
            Configuration
          </h3>

          <div class="space-y-4">
            <UFormField label="Level" description="Optional. Leave empty for a general price.">
              <USelect v-bind="getFieldProps('levelid')" :items="levels.map(l => ({ label: l.name, value: l.levelid }))" placeholder="Select Level" />
            </UFormField>

            <UFormField label="Program">
              <USelect v-bind="getFieldProps('programid')" :items="programs.map(p => ({ label: p.name, value: p.programid }))" placeholder="Select Program" />
            </UFormField>

            <UFormField label="Price Name" description="e.g., Regular Plan.">
              <UInput v-bind="getFieldProps('name')" placeholder="Optional" />
            </UFormField>

            <UFormField label="Description">
              <UInput v-bind="getFieldProps('description')" placeholder="Optional" />
            </UFormField>

            <p v-if="isDuplicateCombination" class="text-xs text-error">
              A price already exists for this Level + Program combination.
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-default rounded-lg p-6 border border-default">
          <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-wallet" class="w-4 h-4 text-toned" />
            Price Amount
          </h3>

          <div class="space-y-4">
            <UFormField label="Total Price" required>
              <UInput v-bind="getFieldProps('harga')" type="number" placeholder="e.g., 5000000" />
              <p class="text-xs text-muted mt-1">{{ formatIDR(formData.harga) }}</p>
            </UFormField>

            <UFormField label="Monthly Price">
              <UInput v-bind="getFieldProps('monthlyprice')" type="number" placeholder="e.g., 500000" />
              <p class="text-xs text-muted mt-1">{{ formatIDR(formData.monthlyprice) }}</p>
            </UFormField>

            <p class="text-xs text-muted">Enter amounts in IDR, numbers only.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-6 border-t border-default">
      <UButton type="button" color="neutral" variant="outline" @click="$emit('close')">
        Cancel
      </UButton>
      <UButton type="submit" color="primary" variant="solid" :loading="isSubmitting" :disabled="isDuplicateCombination" icon="i-lucide-check">
        {{ isEditMode ? 'Update Price' : 'Create Price' }}
      </UButton>
    </div>
  </form>
</template>
