<template>
  <form @submit.prevent="handleSave" class="space-y-6">
    <!-- Two Column Grid Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Left Column: Account & Personal Info -->
      <div class="space-y-6">
        <!-- Account Details Section -->
        <div class="bg-default rounded-lg p-6 border border-default">
          <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-user-check" class="w-4 h-4 text-toned" />
            Account Details
          </h3>
          
          <div class="space-y-4">
            <UFormField label="Username" :required="!isEditMode">
              <UInput v-bind="getFieldProps('username')" :placeholder="isEditMode ? 'Leave blank to keep current' : 'Choose a username'" />
            </UFormField>

            <UFormField label="Email" :required="!isEditMode">
              <UInput v-bind="getFieldProps('email')" type="email" :placeholder="isEditMode ? 'Leave blank to keep current' : 'student@example.com'" />
            </UFormField>

            <UFormField label="Password" :required="!isEditMode" description="Minimum 6 characters.">
              <UInput v-bind="getFieldProps('password')" type="password" :placeholder="isEditMode ? 'Leave blank to keep current' : 'Min. 6 characters'" />
            </UFormField>
          </div>
        </div>

        <!-- Personal Information Section -->
        <div class="bg-default rounded-lg p-6 border border-default">
          <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-user" class="w-4 h-4 text-toned" />
            Personal Information
          </h3>
          
          <div class="space-y-4">
            <UFormField label="Full Name" required>
              <UInput v-bind="getFieldProps('fullname')" placeholder="Full name with titles" />
            </UFormField>

            <UFormField label="Gender" required>
              <USelect v-bind="getFieldProps('gender')" :items="[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' }
              ]" placeholder="Select gender" />
            </UFormField>

            <UFormField label="Birth Date">
              <UInput v-bind="getFieldProps('birthdate')" type="date" />
            </UFormField>

            <UFormField label="Birth Place">
              <UInput v-bind="getFieldProps('birthplace')" placeholder="City of birth" />
            </UFormField>
          </div>
        </div>
      </div>

      <!-- Right Column: Contact & Class Info -->
      <div class="space-y-6">
        <!-- Contact Information Section -->
        <div class="bg-default rounded-lg p-6 border border-default">
          <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-mail" class="w-4 h-4 text-toned" />
            Contact Information
          </h3>
          
          <div class="space-y-4">
            <UFormField label="Phone">
              <UInput v-bind="getFieldProps('phone')" type="tel" placeholder="+62 812-xxx-xxx" />
            </UFormField>

            <UFormField label="Address">
              <UTextarea v-bind="getFieldProps('address')" :rows="3" placeholder="Full address" />
            </UFormField>
          </div>
        </div>

        <!-- Parent Information Section -->
        <div class="bg-default rounded-lg p-6 border border-default">
          <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-users" class="w-4 h-4 text-toned" />
            Parent Information
          </h3>
          
          <div class="space-y-4">
            <UFormField label="Parent Name">
              <UInput v-bind="getFieldProps('parentname')" placeholder="Parent or guardian" />
            </UFormField>

            <UFormField label="Parent Phone">
              <UInput v-bind="getFieldProps('parentphone')" type="tel" placeholder="+62 812-xxx-xxx" />
            </UFormField>
          </div>
        </div>

        <!-- Class Section -->
        <div class="bg-default rounded-lg p-6 border border-default">
          <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-school" class="w-4 h-4 text-toned" />
            Class
          </h3>

          <UFormField label="Class">
            <USelect v-bind="getFieldProps('classid')" :items="[
              { label: 'No class assigned', value: null },
              ...classes.map(cls => ({ label: cls.class_code + ' - ' + (cls.level?.level_name || 'Unknown Level'), value: cls.classid }))
            ]" />
          </UFormField>
        </div>
      </div>
    </div>

    <!-- Actions Footer -->
    <div class="flex justify-end gap-3 pt-6 border-t border-default">
      <UButton type="button" color="neutral" variant="outline" @click="$emit('cancel')">
        Cancel
      </UButton>
      <UButton type="submit" color="primary" variant="solid" :loading="isSubmitting" icon="i-lucide-check">
        {{ isEditMode ? 'Update Student' : 'Create Student' }}
      </UButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useForm } from '../../composables/useForm';


const props = defineProps({
  /** Student data for edit mode */
  student: { type: Object, default: null },
  /** Available classes for dropdown */
  classes: { type: Array, default: () => [] },
  /** Edit or create mode */
  isEditMode: { type: Boolean, default: false }
});

const emit = defineEmits(['submit', 'cancel']);

const { formData, errors, isSubmitting, submit, getFieldProps, reset } = useForm(
  {
    username: '',
    email: '',
    password: '',
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
  },
  {
    username: props.isEditMode ? [] : ['required'],
    email: props.isEditMode ? [] : ['required', 'email'],
    password: props.isEditMode ? [] : ['required', { type: 'minLength', min: 6 }],
    fullname: ['required'],
    gender: ['required']
  }
);

/** Populate form when editing */
watch(() => props.student, (newStudent) => {
  if (newStudent) {
    formData.username = '';
    formData.email = '';
    formData.password = '';
    formData.fullname = newStudent.fullname || '';
    formData.gender = newStudent.gender || '';
    formData.birthdate = newStudent.birthdate ? newStudent.birthdate.split('T')[0] : '';
    formData.birthplace = newStudent.birthplace || '';
    formData.phone = newStudent.phone || '';
    formData.address = newStudent.address || '';
    formData.parentname = newStudent.parentname || '';
    formData.parentphone = newStudent.parentphone || '';
    formData.classid = newStudent.classid || null;
    formData.payment_type = newStudent.payment_type || '';
  } else {
    reset();
  }
}, { immediate: true });

/** Submit form data */
const handleSave = async () => {
  await submit(async (data) => {
    emit('submit', data);
  });
};
</script>
