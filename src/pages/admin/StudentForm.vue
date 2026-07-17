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
              <UInput v-bind="getFieldProps('username')" :placeholder="isEditMode ? 'Leave blank to keep current' : 'Choose a username'" class="w-full" />
            </UFormField>

            <UFormField label="Email" :required="!isEditMode">
              <UInput v-bind="getFieldProps('email')" type="email" :placeholder="isEditMode ? 'Leave blank to keep current' : 'student@example.com'" class="w-full" />
            </UFormField>

            <UFormField label="Password" :required="!isEditMode" description="Minimum 6 characters.">
              <UInput v-bind="getFieldProps('password')" :type="showPassword ? 'text' : 'password'" :placeholder="isEditMode ? 'Leave blank to keep current' : 'Min. 6 characters'" class="w-full">
                <template #trailing>
                  <UButton :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" color="neutral" variant="link" size="xs" :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword" />
                </template>
              </UInput>
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
              <UInput v-bind="getFieldProps('fullname')" placeholder="Full name with titles" class="w-full" />
            </UFormField>

            <UFormField label="Gender" required>
              <USelect v-bind="getFieldProps('gender')" :items="[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' }
              ]" placeholder="Select gender" class="w-full" />
            </UFormField>

            <UFormField label="Birth Date">
              <UInput v-bind="getFieldProps('birthdate')" type="date" class="w-full" />
            </UFormField>

            <UFormField label="Birth Place">
              <UInput v-bind="getFieldProps('birthplace')" placeholder="City of birth" class="w-full" />
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
              <UInput v-bind="getFieldProps('phone')" type="tel" placeholder="+62 812-xxx-xxx" class="w-full" />
            </UFormField>

            <UFormField label="Address">
              <UTextarea v-bind="getFieldProps('address')" :rows="3" placeholder="Full address" class="w-full" />
            </UFormField>
          </div>
        </div>

        <!-- Emergency Contact Section -->
        <div class="bg-default rounded-lg p-6 border border-default">
          <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-users" class="w-4 h-4 text-toned" />
            Emergency Contact
          </h3>

          <div class="space-y-4">
            <UFormField label="Full Name">
              <UInput v-bind="getFieldProps('parentname')" placeholder="Emergency contact's full name" class="w-full" />
            </UFormField>

            <UFormField label="Relationship">
              <UInput v-bind="getFieldProps('relationship')" placeholder="e.g. Parent, Spouse, Sibling" class="w-full" />
            </UFormField>

            <UFormField label="Phone Number">
              <UInput v-bind="getFieldProps('parentphone')" type="tel" placeholder="+62 812-xxx-xxx" class="w-full" />
            </UFormField>
          </div>
        </div>

        <!-- Background Section -->
        <div class="bg-default rounded-lg p-6 border border-default">
          <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-briefcase" class="w-4 h-4 text-toned" />
            Background
          </h3>

          <UFormField label="Occupation">
            <USelect v-bind="getFieldProps('occupation')" :items="OCCUPATIONS" placeholder="Select occupation" class="w-full" />
          </UFormField>
        </div>

        <!-- Course Information Section -->
        <div class="bg-default rounded-lg p-6 border border-default">
          <h3 class="text-sm font-semibold text-default mb-4 flex items-center gap-2">
            <UIcon name="i-lucide-book-open" class="w-4 h-4 text-toned" />
            Course Information
          </h3>

          <div class="space-y-4">
            <UFormField label="Program">
              <USelect v-bind="getFieldProps('program_interest')" :items="PROGRAMS" placeholder="Select program" class="w-full" />
            </UFormField>

            <UFormField label="Current English Level">
              <USelect v-bind="getFieldProps('english_level')" :items="ENGLISH_LEVELS" placeholder="Select level" class="w-full" />
            </UFormField>

            <UFormField label="Have you studied English before?">
              <USelect v-bind="getFieldProps('studied_before')" :items="STUDIED_BEFORE" placeholder="Select" class="w-full" />
            </UFormField>

            <UFormField label="Main reason for learning English">
              <USelect v-bind="getFieldProps('learning_reason')" :items="LEARNING_REASONS" placeholder="Select reason" class="w-full" />
            </UFormField>

            <UFormField label="Learning Mode">
              <USelect v-bind="getFieldProps('learning_mode')" :items="LEARNING_MODES" placeholder="Select mode" class="w-full" />
            </UFormField>

            <UFormField label="Preferred Time">
              <USelect v-bind="getFieldProps('preferred_time')" :items="PREFERRED_TIMES" placeholder="Select time" class="w-full" />
            </UFormField>

            <UFormField label="How did you hear about us?">
              <USelect v-bind="getFieldProps('referral_source')" :items="REFERRAL_SOURCES" placeholder="Select source" class="w-full" />
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
              ...classes.map(cls => ({ label: cls.class_code + (cls.branch ? ' (' + cls.branch + ')' : '') + ' - ' + (cls.level?.level_name || 'Unknown Level'), value: cls.classid }))
            ]" class="w-full" />
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
import {
  OCCUPATIONS,
  PROGRAMS,
  ENGLISH_LEVELS,
  REFERRAL_SOURCES,
  LEARNING_MODES,
  PREFERRED_TIMES,
  STUDIED_BEFORE,
  LEARNING_REASONS
} from '../../config/studentOptions';


const props = defineProps({
  /** Student data for edit mode */
  student: { type: Object, default: null },
  /** Available classes for dropdown */
  classes: { type: Array, default: () => [] },
  /** Edit or create mode */
  isEditMode: { type: Boolean, default: false }
});

const emit = defineEmits(['submit', 'cancel']);
const showPassword = ref(false);

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
    relationship: '',
    classid: null,
    payment_type: '',
    occupation: '',
    program_interest: '',
    english_level: '',
    referral_source: '',
    learning_mode: '',
    preferred_time: '',
    studied_before: '',
    learning_reason: ''
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
    formData.relationship = newStudent.relationship || '';
    formData.classid = newStudent.classid || null;
    formData.payment_type = newStudent.payment_type || '';
    formData.occupation = newStudent.occupation || '';
    formData.program_interest = newStudent.program_interest || '';
    formData.english_level = newStudent.english_level || '';
    formData.referral_source = newStudent.referral_source || '';
    formData.learning_mode = newStudent.learning_mode || '';
    formData.preferred_time = newStudent.preferred_time || '';
    formData.studied_before = newStudent.studied_before || '';
    formData.learning_reason = newStudent.learning_reason || '';
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
