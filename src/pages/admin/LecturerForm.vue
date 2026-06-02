<script setup>
import { ref, watch } from 'vue';
import { useForm } from '../../composables/useForm';


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
    const lecturerData = {};
    const userData = {};

    if (data.fullname) lecturerData.fullname = data.fullname;
    if (data.gender) lecturerData.gender = data.gender;
    if (data.address !== undefined) lecturerData.address = data.address || '';
    if (data.phone) lecturerData.phone = data.phone;
    if (data.birthdate !== undefined) lecturerData.birthdate = data.birthdate || null;
    if (data.birthplace !== undefined) lecturerData.birthplace = data.birthplace || '';
    if (data.lasteducation !== undefined) lecturerData.lasteducation = data.lasteducation || '';
    if (data.photo !== undefined) lecturerData.photo = data.photo;

    if (props.isEditMode) {
      if (data.email && data.email.trim()) userData.email = data.email;
      if (data.password && data.password.trim()) userData.password = data.password;
    } else {
      if (data.username) lecturerData.username = data.username;
      if (data.email) lecturerData.email = data.email;
      if (data.password) lecturerData.password = data.password;
    }

    emit('save', { lecturerData, userData });
  });
};
</script>

<template>
  <form @submit.prevent="handleSave" class="max-w-5xl mx-auto p-1">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- Left Column (8 units) -->
      <div class="lg:col-span-8 space-y-6">
        <!-- Section: Identity -->
        <section class="bg-default rounded-lg p-6 border border-default">
          <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-user-check" class="w-4 h-4 text-toned" />
            Lecturer Profile
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Full Name" required class="md:col-span-2">
              <UInput v-bind="getFieldProps('fullname')" placeholder="Full name with titles" />
            </UFormField>

            <UFormField label="Gender">
              <USelect v-bind="getFieldProps('gender')" :items="[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' }
              ]" placeholder="Select gender" />
            </UFormField>

            <UFormField label="Phone Number" required>
              <UInput v-bind="getFieldProps('phone')" type="tel" placeholder="+62 ..." />
            </UFormField>

            <UFormField label="Birth Place">
              <UInput v-bind="getFieldProps('birthplace')" placeholder="City of birth" />
            </UFormField>

            <UFormField label="Birth Date">
              <UInput v-bind="getFieldProps('birthdate')" type="date" />
            </UFormField>
          </div>
        </section>

        <!-- Section: Account -->
        <section class="bg-default rounded-lg p-6 border border-default">
          <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-lock" class="w-4 h-4 text-toned" />
            Security & Access
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UFormField label="Username" required>
              <UInput v-bind="getFieldProps('username')" :disabled="isEditMode" :placeholder="isEditMode ? 'Cannot be changed' : 'Unique username'" />
            </UFormField>

            <UFormField label="Email Address" :required="!isEditMode">
              <UInput v-bind="getFieldProps('email')" type="email" :placeholder="isEditMode ? 'Current email' : 'lecturer@example.com'" />
            </UFormField>

            <UFormField label="Access Password" :required="!isEditMode" class="md:col-span-2" description="Minimum 8 characters.">
              <UInput v-bind="getFieldProps('password')" type="password" :placeholder="isEditMode ? 'Leave empty to keep current' : 'Min. 8 characters'" />
            </UFormField>
          </div>
        </section>
      </div>

      <!-- Right Column (4 units) -->
      <div class="lg:col-span-4 space-y-6">
        <!-- Section: Professional Info -->
        <section class="bg-default rounded-lg p-6 border border-default">
          <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-graduation-cap" class="w-4 h-4 text-toned" />
            Professional Info
          </h3>

          <div class="space-y-4">
            <UFormField label="Latest Education">
              <UInput v-bind="getFieldProps('lasteducation')" placeholder="e.g., M.Sc in Computer Science" />
            </UFormField>

            <UFormField label="Residential Address">
              <UTextarea v-bind="getFieldProps('address')" placeholder="Full physical address" :rows="4" />
            </UFormField>
          </div>
        </section>
      </div>
    </div>

    <!-- Sticky Actions -->
    <div class="mt-6 flex justify-end gap-3 pt-6 border-t border-default">
      <UButton type="button" color="neutral" variant="outline" @click="$emit('close')">
        Cancel
      </UButton>
      <UButton type="submit" color="primary" variant="solid" :loading="isSubmitting" icon="i-lucide-check">
        {{ isEditMode ? 'Update Lecturer' : 'Create Lecturer' }}
      </UButton>
    </div>
  </form>
</template>
