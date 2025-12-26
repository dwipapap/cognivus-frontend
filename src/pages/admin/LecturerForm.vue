<script setup>
import { ref, watch } from 'vue';
import { useForm } from '../../composables/useForm';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseSelect from '../../components/form/BaseSelect.vue';
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
    const lecturerData = {};
    const userData = {};
    
    // Lecturer fields
    if (data.fullname) lecturerData.fullname = data.fullname;
    if (data.gender) lecturerData.gender = data.gender;
    if (data.address !== undefined) lecturerData.address = data.address || '';
    if (data.phone) lecturerData.phone = data.phone;
    if (data.birthdate !== undefined) lecturerData.birthdate = data.birthdate || null;
    if (data.birthplace !== undefined) lecturerData.birthplace = data.birthplace || '';
    if (data.lasteducation !== undefined) lecturerData.lasteducation = data.lasteducation || '';
    if (data.photo !== undefined) lecturerData.photo = data.photo;
    
    // User fields (for edit mode, only if provided)
    if (props.isEditMode) {
      if (data.email && data.email.trim()) userData.email = data.email;
      if (data.password && data.password.trim()) userData.password = data.password;
    } else {
      // In create mode, always send user fields
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
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Left Column (8 units) -->
      <div class="lg:col-span-8 space-y-8">
        <!-- Section: Identity -->
        <section class="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm transition-all duration-300 hover:shadow-md">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-blue-50 rounded-lg">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 tracking-tight">Lecturer Profile</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BaseInput 
              v-bind="getFieldProps('fullname')" 
              label="Full Name" 
              placeholder="Full name with titles"
              variant="outline"
              class="md:col-span-2"
              required 
            />

            <BaseSelect
              v-model="formData.gender"
              label="Gender"
              :options="[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' }
              ]"
              placeholder="Select gender"
              variant="outline"
            />

            <BaseInput 
              v-bind="getFieldProps('phone')" 
              type="tel" 
              label="Phone Number"
              placeholder="+62 ..."
              variant="outline"
              required 
            />

            <BaseInput 
              v-bind="getFieldProps('birthplace')" 
              label="Birth Place"
              placeholder="City of birth"
              variant="outline"
            />

            <BaseInput 
              v-bind="getFieldProps('birthdate')" 
              type="date" 
              label="Birth Date" 
              variant="outline"
            />
          </div>
        </section>

        <!-- Section: Account -->
        <section class="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm transition-all duration-300 hover:shadow-md">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-blue-50 rounded-lg">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 tracking-tight">Security & Access</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <BaseInput 
              v-bind="getFieldProps('username')" 
              label="Username" 
              :disabled="isEditMode"
              :placeholder="isEditMode ? 'Username is locked' : 'Unique username'"
              variant="outline"
              required 
            />

            <BaseInput 
              v-bind="getFieldProps('email')" 
              type="email" 
              label="Email Address"
              :placeholder="isEditMode ? 'Current email' : 'lecturer@example.com'"
              variant="outline"
              :required="!isEditMode"
            >
              <template #help v-if="isEditMode">
                <span class="text-xs text-blue-600/70 italic">Leave empty to keep existing email</span>
              </template>
            </BaseInput>

            <BaseInput
              v-bind="getFieldProps('password')"
              type="password"
              label="Access Password"
              :placeholder="isEditMode ? '••••••••' : 'Min. 8 characters'"
              variant="outline"
              class="md:col-span-2"
              :required="!isEditMode"
            >
              <template #help v-if="isEditMode">
                <span class="text-xs text-blue-600/70 italic">Leave empty to keep current password</span>
              </template>
            </BaseInput>
          </div>
        </section>
      </div>

      <!-- Right Column (4 units) -->
      <div class="lg:col-span-4 space-y-8">
        <!-- Section: Professional Info -->
        <section class="bg-blue-600 rounded-2xl p-6 border border-blue-500 shadow-lg text-white">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-white/10 rounded-lg">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
              </svg>
            </div>
            <h3 class="text-lg font-bold tracking-tight">Professional Info</h3>
          </div>

          <div class="space-y-5">
            <BaseInput 
              v-bind="getFieldProps('lasteducation')" 
              label="Latest Education"
              placeholder="e.g., M.Sc in Computer Science"
              variant="filled"
              class="[&_label]:text-blue-50 [&_input]:bg-blue-700/30 [&_input]:border-blue-400/50 [&_input]:text-white [&_input]:placeholder-blue-300"
            />
            
            <BaseTextarea 
              v-bind="getFieldProps('address')" 
              label="Residential Address"
              placeholder="Full physical address"
              :rows="4"
              variant="filled"
              class="[&_label]:text-blue-50 [&_textarea]:bg-blue-700/30 [&_textarea]:border-blue-400/50 [&_textarea]:text-white [&_textarea]:placeholder-blue-300"
            />
          </div>
        </section>

        <!-- Help Card -->
        <section class="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm relative overflow-hidden">
          <div class="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-blue-50 rounded-full"></div>
          
          <h4 class="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
            </svg>
            Guidelines
          </h4>
          
          <ul class="space-y-3">
            <li v-for="(item, idx) in [
              'Username is permanent after creation.',
              'Email must be unique and valid.',
              'Passwords require at least 8 characters.',
              'Phone number for direct coordination.'
            ]" :key="idx" class="flex items-start gap-2.5 group">
              <div class="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-125 transition-transform"></div>
              <span class="text-xs text-gray-600 leading-relaxed">{{ item }}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <!-- Sticky Actions -->
    <div class="mt-10 flex items-center justify-between gap-4 pt-6 border-t border-blue-50">
      <span class="hidden sm:block text-xs text-gray-400 font-medium">
        * Fields marked with asterisk are required
      </span>
      <div class="flex items-center gap-3 w-full sm:w-auto">
        <BaseButton 
          type="button" 
          variant="secondary" 
          size="lg"
          class="flex-1 sm:flex-none"
          @click="$emit('close')"
        >
          Discard
        </BaseButton>
        <BaseButton 
          type="submit" 
          variant="primary" 
          size="lg"
          class="flex-1 sm:flex-none shadow-blue-200"
          :loading="isSubmitting"
        >
          <template #icon>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </template>
          {{ isEditMode ? 'Save Changes' : 'Register Lecturer' }}
        </BaseButton>
      </div>
    </div>
  </form>
</template>