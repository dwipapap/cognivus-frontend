<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Full Name -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
      <input
        v-model="formData.fullname"
        type="text"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter full name"
      />
    </div>

    <!-- Gender -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
      <select
        v-model="formData.gender"
        required
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select gender</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    </div>

    <!-- Birth Info -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
        <input
          v-model="formData.birthdate"
          type="date"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Birth Place</label>
        <input
          v-model="formData.birthplace"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter birth place"
        />
      </div>
    </div>

    <!-- Contact Info -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
      <input
        v-model="formData.phone"
        type="tel"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter phone number"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
      <textarea
        v-model="formData.address"
        rows="2"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter address"
      ></textarea>
    </div>

    <!-- Parent Info -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
      <input
        v-model="formData.parentname"
        type="text"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter parent name"
      />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
      <input
        v-model="formData.parentphone"
        type="tel"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter parent phone"
      />
    </div>

    <!-- Class Assignment -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Class</label>
      <select
        v-model="formData.classid"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option :value="null">No class assigned</option>
        <option v-for="cls in classes" :key="cls.classid" :value="cls.classid">
          {{ cls.class_code }} - {{ cls.level?.name }}
        </option>
      </select>
    </div>

    <!-- Payment Type -->
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
      <select
        v-model="formData.payment_type"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">Select payment type</option>
        <option value="Monthly">Monthly</option>
        <option value="Full">Full Payment</option>
      </select>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4">
      <BaseButton type="button" variant="secondary" @click="$emit('cancel')">
        Cancel
      </BaseButton>
      <BaseButton type="submit" variant="primary">
        {{ isEditMode ? 'Update' : 'Create' }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import BaseButton from '../../components/ui/BaseButton.vue';

const props = defineProps({
  /** Student data for edit mode */
  student: { type: Object, default: null },
  /** Available classes for dropdown */
  classes: { type: Array, default: () => [] },
  /** Edit or create mode */
  isEditMode: { type: Boolean, default: false }
});

const emit = defineEmits(['submit', 'cancel']);

const formData = ref({
  fullname: '',
  gender: '',
  birthdate: '',
  birthplace: '',
  phone: '',
  address: '',
  parentname: '',
  parentphone: '',
  classid: null,
  payment_type: ''
});

/** Populate form when editing */
watch(() => props.student, (newStudent) => {
  if (newStudent) {
    formData.value = {
      fullname: newStudent.fullname || '',
      gender: newStudent.gender || '',
      birthdate: newStudent.birthdate || '',
      birthplace: newStudent.birthplace || '',
      phone: newStudent.phone || '',
      address: newStudent.address || '',
      parentname: newStudent.parentname || '',
      parentphone: newStudent.parentphone || '',
      classid: newStudent.classid || null,
      payment_type: newStudent.payment_type || ''
    };
  }
}, { immediate: true });

/** Submit form data */
const handleSubmit = () => {
  emit('submit', formData.value);
};
</script>
