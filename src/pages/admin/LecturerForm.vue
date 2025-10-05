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
  {},
  {
    username: ['required'],
    email: ['required', 'email'],
    password: props.isEditMode ? [] : ['required', { type: 'minLength', min: 8 }],
    fullname: ['required'],
    phone: ['required', 'phone']
  }
);

// Watch for changes to populate form
watch(() => props.lecturer, (newVal) => {
  if (newVal) {
    formData.username = newVal.tbuser?.username || '';
    formData.email = newVal.tbuser?.email || '';
    formData.fullname = newVal.fullname || '';
    formData.birthplace = newVal.birthplace || '';
    formData.address = newVal.address || '';
    formData.phone = newVal.phone || '';
    formData.birthdate = newVal.birthdate ? newVal.birthdate.split('T')[0] : '';
    formData.lasteducation = newVal.lasteducation || '';
    formData.gender = newVal.gender || '';
    formData.password = '';
  } else {
    reset();
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
        <BaseInput v-bind="getFieldProps('phone')" type="tel" label="Phone Number" required />
        <BaseInput v-bind="getFieldProps('gender')" label="Gender" placeholder="L or P" />
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BaseInput v-bind="getFieldProps('birthplace')" label="Birthplace" />
        <BaseInput v-bind="getFieldProps('birthdate')" type="date" label="Birthdate" />
    </div>
    <BaseInput v-bind="getFieldProps('lasteducation')" label="Last Education" />
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