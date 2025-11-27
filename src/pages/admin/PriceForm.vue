<script setup>
import { watch, computed } from 'vue';
import { useForm } from '../../composables/useForm';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseSelect from '../../components/form/BaseSelect.vue';
import BaseButton from '../../components/ui/BaseButton.vue';

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

/** Watch for changes to populate form */
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

/** Check if the selected level/program combination already exists */
const isDuplicateCombination = computed(() => {
  if (!formData.levelid || !formData.programid) return false;
  
  return props.prices.some(price => {
    // Skip the current item when editing
    if (props.isEditMode && price.priceid === props.priceItem?.priceid) {
      return false;
    }
    return price.levelid === Number(formData.levelid) && 
           price.programid === Number(formData.programid);
  });
});

/** Handle form submission */
const handleSave = async () => {
  await submit(async (data) => {
    emit('save', data);
  });
};
</script>

<template>
  <form @submit.prevent="handleSave" class="space-y-6">
    <!-- Two Column Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Left Column: Price Configuration -->
      <div class="space-y-6">
        <!-- Selection Section -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
            </svg>
            Configuration
          </h3>
          
          <div class="space-y-4">
            <!-- Level -->
            <BaseSelect 
              v-bind="getFieldProps('levelid')" 
              label="Level"
            >
              <option value="">Select Level</option>
              <option v-for="level in levels" :key="level.levelid" :value="level.levelid">
                {{ level.name }}
              </option>
            </BaseSelect>

            <!-- Program -->
            <BaseSelect 
              v-bind="getFieldProps('programid')" 
              label="Program"
            >
              <option value="">Select Program</option>
              <option v-for="program in programs" :key="program.programid" :value="program.programid">
                {{ program.name }}
              </option>
            </BaseSelect>

            <!-- Name -->
            <BaseInput 
              v-bind="getFieldProps('name')" 
              label="Price Name" 
              placeholder="e.g., Regular Plan"
            />

            <!-- Description -->
            <BaseInput 
              v-bind="getFieldProps('description')" 
              label="Description" 
              placeholder="Brief description of this pricing"
            />

            <!-- Duplicate Warning -->
            <div v-if="isDuplicateCombination" class="bg-red-50 border border-red-300 rounded-lg p-3">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                <div class="text-sm text-red-800">
                  <p class="font-medium">Duplicate Combination Detected!</p>
                  <p class="text-xs mt-1">A price already exists for this Level + Program combination. Please choose a different combination or edit the existing price.</p>
                </div>
              </div>
            </div>

            <div class="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div class="text-sm text-amber-800">
                  <p class="font-medium">Optional Fields</p>
                  <p class="text-xs mt-1">Level and Program are optional. You can leave them empty to set a general price.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Price Details Section -->
        <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Price Amount
          </h3>
          
          <div class="space-y-4">
            <!-- Total Price -->
            <BaseInput 
              v-bind="getFieldProps('harga')" 
              label="Total Price" 
              type="number"
              placeholder="e.g., 5000000"
              required 
            />

            <!-- Monthly Price -->
            <BaseInput 
              v-bind="getFieldProps('monthlyprice')" 
              label="Monthly Price" 
              type="number"
              placeholder="e.g., 500000"
            />

            <div class="bg-green-50 border border-green-200 rounded-lg p-3">
              <p class="text-xs text-green-800">
                <span class="font-medium">Currency:</span> Indonesian Rupiah (IDR)
              </p>
              <p class="text-xs text-green-700 mt-1">
                Enter the amount in numbers only, without currency symbol or separators.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Information & Preview -->
      <div class="space-y-6">
        <!-- Price Preview -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            Price Preview
          </h3>
          
          <div class="space-y-3">
            <div class="bg-white rounded-lg p-3 border border-green-300">
              <p class="text-xs text-gray-600 mb-1">Total Price</p>
              <p class="text-2xl font-bold text-green-600">
                {{ formData.harga ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(formData.harga) : 'Rp 0' }}
              </p>
            </div>
            
            <div class="bg-white rounded-lg p-3 border border-blue-300">
              <p class="text-xs text-gray-600 mb-1">Monthly Price</p>
              <p class="text-xl font-bold text-blue-600">
                {{ formData.monthlyprice ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(formData.monthlyprice) : 'Rp 0' }}
              </p>
            </div>
            
            <div class="bg-white rounded-lg p-3 border border-blue-300">
              <p class="text-xs text-gray-600 mb-1">Configuration</p>
              <div class="space-y-1">
                <p class="text-sm">
                  <span class="font-medium">Level:</span> 
                  <span class="text-gray-700">{{ formData.levelid ? levels.find(l => l.levelid === Number(formData.levelid))?.name : 'Not set' }}</span>
                </p>
                <p class="text-sm">
                  <span class="font-medium">Program:</span> 
                  <span class="text-gray-700">{{ formData.programid ? programs.find(p => p.programid === Number(formData.programid))?.name : 'Not set' }}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pricing Guide -->
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
          <h4 class="text-sm font-semibold text-gray-900 mb-3">Pricing Guide</h4>
          <ul class="space-y-2 text-xs text-gray-700">
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Set different prices for different levels</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Programs allow for different payment plans</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Ensure prices are competitive and fair</span>
            </li>
            <li class="flex items-start gap-2">
              <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span>Review pricing regularly based on market</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
      <BaseButton type="button" variant="secondary" @click="$emit('close')">
        Cancel
      </BaseButton>
      <BaseButton 
        type="submit" 
        variant="primary" 
        :loading="isSubmitting"
        :disabled="isDuplicateCombination"
      >
        <template #icon>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </template>
        {{ isEditMode ? 'Update Price' : 'Create Price' }}
      </BaseButton>
    </div>
  </form>
</template>
