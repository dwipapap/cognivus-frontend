<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { studentAPI, gradeAPI, paymentAPI, userAPI } from '../../services/api';
import { useForm } from '../../composables/useForm';
import LoadingBar from '../../components/ui/LoadingBar.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseSelect from '../../components/form/BaseSelect.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';
import Modal from '../../components/ui/Modal.vue';

const route = useRoute();
const router = useRouter();
const studentId = route.params.id;

const student = ref(null);
const grades = ref([]);
const transactions = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');
const showNotificationModal = ref(false);
const notificationMessage = ref('');
const notificationType = ref('info');

// Form for editing
const { formData, errors, isSubmitting, submit, getFieldProps } = useForm(
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
    fullname: ['required'],
    gender: ['required']
  }
);

/** Show notification */
const showNotification = (type, message) => {
  notificationType.value = type;
  notificationMessage.value = message;
  showNotificationModal.value = true;
};

/** Get gender display */
const getGenderDisplay = (code) => {
  if (code === 'L') return 'Male';
  if (code === 'P') return 'Female';
  return '-';
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const handleDownloadCertificate = async (gradeId, testType) => {
  try {
    const response = await gradeAPI.downloadCertificate(gradeId);
    
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certificate_${testType || 'Test'}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    showNotification('error', 'Failed to download certificate. Please try again.');
  }
};

const getStatusBadge = (status) => {
  const badges = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    failed: 'bg-red-100 text-red-800 border-red-200'
  };
  return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const getAverageScore = (grade) => {
  const scores = [
    grade.listening_score,
    grade.speaking_score,
    grade.reading_score,
    grade.writing_score
  ].filter(s => s !== null && s !== undefined);
  
  if (scores.length === 0) return '-';
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return avg.toFixed(1);
};

/** Get initials for avatar */
const getInitials = (name) => {
  if (!name) return 'ST';
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

/** Fetch student data */
const fetchStudentData = async () => {
  try {
    isLoading.value = true;
    errorMessage.value = '';
    
    const studentResponse = await studentAPI.getStudentById(studentId);
    
    if (!studentResponse.data.success) {
      errorMessage.value = 'Student not found';
      return;
    }
    
    let studentData = studentResponse.data.data;
    if (Array.isArray(studentData)) {
      studentData = studentData[0];
    }
    
    if (!studentData) {
      errorMessage.value = 'Student not found';
      return;
    }
    
    student.value = studentData;
    
    // Populate form
    formData.fullname = studentData.fullname || '';
    formData.gender = studentData.gender || '';
    formData.birthdate = studentData.birthdate ? studentData.birthdate.split('T')[0] : '';
    formData.birthplace = studentData.birthplace || '';
    formData.phone = studentData.phone || '';
    formData.address = studentData.address || '';
    formData.parentname = studentData.parentname || '';
    formData.parentphone = studentData.parentphone || '';
    formData.classid = studentData.classid || null;
    formData.payment_type = studentData.payment_type || '';
    
    // Fetch grades
    if (student.value.studentid) {
      try {
        const gradesResponse = await gradeAPI.getGradeById(student.value.studentid);
        if (gradesResponse.data.success) {
          grades.value = Array.isArray(gradesResponse.data.data) 
            ? gradesResponse.data.data 
            : [];
        }
      } catch (error) {
        console.error('Error fetching grades:', error);
        grades.value = [];
      }

      try {
        const paymentResponse = await paymentAPI.getPaymentHistory(student.value.studentid);
        if (paymentResponse.data.success) {
          transactions.value = Array.isArray(paymentResponse.data.data)
            ? paymentResponse.data.data.slice(0, 5)
            : [];
        }
      } catch (error) {
        console.error('Error fetching payment history:', error);
        transactions.value = [];
      }
    }
    
  } catch (error) {
    errorMessage.value = 'Failed to load student data';
    console.error('Error fetching student:', error);
  } finally {
    isLoading.value = false;
  }
};

/** Handle save */
const handleSave = async () => {
  await submit(async (data) => {
    try {
      const userId = student.value.tbuser?.userid || student.value.userid;
      if (!userId) {
        throw new Error('User ID not found for update operation');
      }

      // Prepare student data
      const studentData = {
        fullname: data.fullname,
        gender: data.gender === 'Male' ? 'L' : data.gender === 'Female' ? 'P' : data.gender,
        birthdate: data.birthdate || null,
        birthplace: data.birthplace || null,
        phone: data.phone || null,
        address: data.address || null,
        parentname: data.parentname || null,
        parentphone: data.parentphone || null,
        classid: data.classid ? Number(data.classid) : null,
        payment_type: data.payment_type || null
      };

      // Prepare user data
      const userData = {};
      if (data.email && data.email.trim()) userData.email = data.email;
      if (data.password && data.password.trim()) userData.password = data.password;
      if (data.username && data.username.trim()) userData.username = data.username;

      // Update student data
      await studentAPI.updateStudent(userId, studentData);
      
      // Update user credentials if any were provided
      if (Object.keys(userData).length > 0) {
        await userAPI.updateUser(userId, userData);
      }

      showNotification('success', 'Student updated successfully!');
      fetchStudentData(); // Refresh data
    } catch (error) {
      showNotification('error', error.response?.data?.message || 'Failed to save student.');
    }
  });
};

/** Navigate back */
const goBack = () => {
  router.push({ name: 'AdminManageStudents' });
};

onMounted(() => {
  fetchStudentData();
});
</script>

<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-8">
      <button
        @click="goBack"
        class="mb-6 inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 rounded-full font-medium transition-all hover:shadow-md"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Students
      </button>
      <h1 class="text-2xl font-bold text-gray-800">Student Details</h1>
      <p class="text-gray-600 mt-1">View and edit student information</p>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="max-w-2xl mx-auto py-20">
      <LoadingBar :loading="true" color="blue" :duration="2000" />
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
      <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-red-900 mb-2">Error Loading Data</h3>
      <p class="text-red-600 mb-6">{{ errorMessage }}</p>
      <BaseButton 
        variant="danger"
        @click="fetchStudentData"
      >
        Try Again
      </BaseButton>
    </div>

    <!-- Content -->
    <div v-else-if="student" class="space-y-8">
      <!-- Two Column Grid: Student Info + Payment History -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Student Info Card (Read-only display) -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <!-- Decorative Header -->
          <div class="h-24 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
            <div class="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>
          
          <div class="px-8 pb-8">
            <div class="relative flex justify-between items-end -mt-12 mb-6">
              <div class="w-24 h-24 rounded-2xl border-4 border-white bg-white shadow-lg flex items-center justify-center text-3xl font-bold text-indigo-600 bg-gradient-to-br from-indigo-50 to-blue-50">
                {{ getInitials(student.fullname) }}
              </div>
              <span class="mb-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-100">
                Student
              </span>
            </div>

            <div class="mb-8">
              <h2 class="text-2xl font-bold text-gray-900">{{ student.fullname }}</h2>
              <div class="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span class="flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  {{ student.tbuser?.email || 'No email' }}
                </span>
                <span class="w-1 h-1 rounded-full bg-gray-300"></span>
                <span class="flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  {{ student.phone || 'No phone' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment History -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
            <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Recent Payments
            </h2>
            <span class="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-200 shadow-sm">
              Latest 5
            </span>
          </div>
          
          <div v-if="transactions.length === 0" class="py-12 text-center px-4">
            <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
              </svg>
            </div>
            <p class="text-gray-500 font-medium">No payment records found</p>
          </div>
          
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-100">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                  <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-100">
                <tr v-for="transaction in transactions" :key="transaction.paymentid">
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">#{{ transaction.paymentid }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(transaction.created_at) }}</td>
                  <td class="px-6 py-4 text-sm text-gray-900 font-medium">{{ transaction.amount ? `Rp ${transaction.amount.toLocaleString()}` : '-' }}</td>
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full capitalize" :class="getStatusBadge(transaction.status)">
                      {{ transaction.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 bg-gray-50/30">
          <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
            Edit Student Information
          </h2>
        </div>
        
        <form @submit.prevent="handleSave" class="p-6">
          <!-- Two Column Grid Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- Left Column -->
            <div class="space-y-6">
              <!-- Account Details Section -->
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                  Account Details (Optional)
                </h3>
                
                <div class="space-y-4">
                  <BaseInput
                    v-bind="getFieldProps('username')"
                    label="Username"
                    placeholder="Leave blank to keep current username"
                  />
                  <p class="text-xs text-gray-500 -mt-2">Leave blank to keep existing username</p>

                  <BaseInput
                    v-bind="getFieldProps('email')"
                    type="email"
                    label="Email"
                    placeholder="Leave blank to keep current email"
                  />
                  <p class="text-xs text-gray-500 -mt-2">Leave blank to keep existing email</p>

                  <BaseInput
                    v-bind="getFieldProps('password')"
                    type="password"
                    label="Password"
                    placeholder="Leave blank to keep current password"
                  />
                  <p class="text-xs text-gray-500 -mt-2">Leave blank to keep existing password</p>
                </div>
              </div>

              <!-- Personal Information Section -->
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
                  </svg>
                  Personal Information
                </h3>
                
                <div class="space-y-4">
                  <BaseInput
                    v-bind="getFieldProps('fullname')"
                    label="Full Name"
                    required
                    placeholder="Enter full name"
                  />

                  <BaseSelect
                    v-bind="getFieldProps('gender')"
                    label="Gender"
                    required
                    :options="['Male', 'Female']"
                    placeholder="Select gender"
                  />

                  <BaseInput
                    v-bind="getFieldProps('birthdate')"
                    type="date"
                    label="Birth Date"
                  />

                  <BaseInput
                    v-bind="getFieldProps('birthplace')"
                    label="Birth Place"
                    placeholder="Enter birth place"
                  />
                </div>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <!-- Contact Information Section -->
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                  Contact Information
                </h3>
                
                <div class="space-y-4">
                  <BaseInput
                    v-bind="getFieldProps('phone')"
                    type="tel"
                    label="Phone"
                    placeholder="Enter phone number"
                  />

                  <BaseTextarea
                    v-bind="getFieldProps('address')"
                    label="Address"
                    :rows="3"
                    placeholder="Enter address"
                    resize="none"
                  />
                </div>
              </div>

              <!-- Parent Information Section -->
              <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  Parent Information
                </h3>
                
                <div class="space-y-4">
                  <BaseInput
                    v-bind="getFieldProps('parentname')"
                    label="Parent Name"
                    placeholder="Enter parent name"
                  />

                  <BaseInput
                    v-bind="getFieldProps('parentphone')"
                    type="tel"
                    label="Parent Phone"
                    placeholder="Enter parent phone"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Actions Footer -->
          <div class="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <BaseButton type="submit" variant="primary" :loading="isSubmitting">
              <template #icon>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </template>
              Update Student
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Grades Section -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/30">
          <div>
            <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
              Academic Performance
            </h2>
            <p class="text-sm text-gray-500 mt-1">Test scores and progress reports</p>
          </div>
          <BaseButton
            variant="primary"
            @click="router.push({ name: 'AdminAddGrade', params: { userid: studentId } })"
          >
            <template #icon>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </template>
            Add New Grade
          </BaseButton>
        </div>
        
        <div v-if="grades.length === 0" class="text-center py-16 px-4">
          <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900">No grades recorded</h3>
          <p class="text-gray-500 mt-1 max-w-sm mx-auto">Start by adding a new grade entry for this student to track their progress.</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-100">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Test Type</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Listening</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Speaking</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Reading</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Writing</th>
                <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Final Score</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Certificate</th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-100">
              <tr v-for="grade in grades" :key="grade.gradeid" class="hover:bg-gray-50 transition-colors group">
                <td class="px-6 py-4">
                  <span class="font-medium text-gray-900 block">{{ grade.test_type }}</span>
                </td>
                <td class="px-6 py-4 text-center text-sm text-gray-600">{{ grade.listening_score || '-' }}</td>
                <td class="px-6 py-4 text-center text-sm text-gray-600">{{ grade.speaking_score || '-' }}</td>
                <td class="px-6 py-4 text-center text-sm text-gray-600">{{ grade.reading_score || '-' }}</td>
                <td class="px-6 py-4 text-center text-sm text-gray-600">{{ grade.writing_score || '-' }}</td>
                <td class="px-6 py-4 text-center">
                  <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-700 font-bold text-sm border border-blue-100">
                    {{ grade.final_score ?? '-' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(grade.date_taken) }}</td>
                <td class="px-6 py-4">
                  <BaseButton
                    size="sm"
                    variant="secondary"
                    @click="handleDownloadCertificate(grade.gradeid, grade.test_type)"
                  >
                    Download
                  </BaseButton>
                </td>
                <td class="px-6 py-4 text-right">
                  <BaseButton
                    size="sm"
                    variant="secondary"
                    rounded="lg"
                    @click="router.push({ name: 'AdminEditGrade', params: { userid: studentId, gradeid: grade.gradeid } })"
                  >
                    Edit
                  </BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Notification Modal -->
    <Modal 
      :show="showNotificationModal" 
      @close="showNotificationModal = false" 
      :type="notificationType"
      :message="notificationMessage"
      variant="gradient"
    />
  </div>
</template>
