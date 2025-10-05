<script setup>
import { ref, watch } from 'vue';
import { useForm } from '../../composables/useForm';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';
import BaseButton from '../../components/ui/BaseButton.vue';

const props = defineProps({
  lecturer: {
    type: Object,
    default: null
  },
  isEditMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'save']);

const { formData, errors, isSubmitting, submit, getFieldProps, reset } = useForm(
  {}, // Initial data will be set via watcher
  {
    username: ['required'],
    email: ['required', 'email'],
    password: props.isEditMode ? [] : ['required', { type: 'minLength', min: 8 }], // Password only required on create
    fullname: ['required'],
    phone_number: ['required', 'phone']
  }
);

// Watch for changes in the lecturer prop to populate the form
watch(() => props.lecturer, (newVal) => {
  if (newVal) {
    formData.username = newVal.users?.username || '';
    formData.email = newVal.users?.email || '';
    formData.fullname = newVal.fullname || '';
    formData.age = newVal.age || '';
    formData.birthplace = newVal.birthplace || '';
    formData.address = newVal.address || '';
    formData.phone_number = newVal.phone_number || '';
    formData.birthdate = newVal.birthdate ? newVal.birthdate.split('T')[0] : '';
    formData.academic_background = newVal.academic_background || '';
    formData.password = ''; // Selalu kosongkan password
  } else {
    reset(); // Reset form jika tidak ada data lecturer (mode tambah)
  }
}, { immediate: true });


const handleSave = async () => {
  await submit(async (data) => {
    emit('save', data);
  });
};
</script>

<template>
  <form @submit.prevent="handleSave" class="space-y-4">
    <h2 class="text-xl font-bold text-white mb-4">
      {{ isEditMode ? 'Edit Lecturer' : 'Add New Lecturer' }}
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BaseInput v-bind="getFieldProps('username')" label="Username" :disabled="isEditMode" required />
      <BaseInput v-bind="getFieldProps('email')" type="email" label="Email" required />
    </div>
    <BaseInput
      v-if="!isEditMode"
      v-bind="getFieldProps('password')"
      type="password"
      label="Password"
      placeholder="Minimum 8 characters"
      required
    />
     <p v-if="isEditMode" class="text-xs text-gray-400 -mt-2">Password can only be changed by the user.</p>


    <hr class="border-gray-600 my-4" />
    <BaseInput v-bind="getFieldProps('fullname')" label="Full Name" required />
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseInput v-bind="getFieldProps('phone_number')" type="tel" label="Phone Number" required />
        <BaseInput v-bind="getFieldProps('age')" type="number" label="Age" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseInput v-bind="getFieldProps('birthplace')" label="Birthplace" />
        <BaseInput v-bind="getFieldProps('birthdate')" type="date" label="Birthdate" />
    </div>
    <BaseInput v-bind="getFieldProps('academic_background')" label="Academic Background" />
    <BaseTextarea v-bind="getFieldProps('address')" label="Address" :rows="3" />

    <div class="flex justify-end space-x-3 pt-4">
      <BaseButton type="button" variant="glass-secondary" @click="$emit('close')">
        Cancel
      </BaseButton>
      <BaseButton type="submit" variant="glass-primary" :loading="isSubmitting">
        Save
      </BaseButton>
    </div>
  </form>
</template>