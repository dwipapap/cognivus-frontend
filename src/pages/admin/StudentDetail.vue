<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { studentAPI, gradeAPI, paymentAPI, userAPI, classAPI, levelAPI } from '../../services/api';
import { useForm } from '../../composables/useForm';
import LoadingSpinner from '../../components/ui/LoadingSpinner.vue';
import BaseButton from '../../components/ui/BaseButton.vue';
import BaseInput from '../../components/form/BaseInput.vue';
import BaseSelect from '../../components/form/BaseSelect.vue';
import BaseTextarea from '../../components/form/BaseTextarea.vue';
import Modal from '../../components/ui/Modal.vue';
import { formatDate, getAverageScore, getInitials } from '../../utils/formatters';

const route = useRoute();
const router = useRouter();
const studentId = route.params.id;

const student = ref(null);
const classInfo = ref(null);
const levelInfo = ref(null);
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

/** Get status badge classes */
const getStatusBadge = (status) => {
  const classes = {
    success: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    failed: 'bg-red-100 text-red-800 border-red-200'
  };
  return classes[status] || 'bg-slate-100 text-slate-800 border-slate-200';
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

    // Fetch class data
    if (studentData.classid) {
      try {
        const classResponse = await classAPI.getClassById(studentData.classid);
        if (classResponse.data.success) {
          let classData = classResponse.data.data;
          if (Array.isArray(classData)) {
            classData = classData[0];
          }
          classInfo.value = classData;

          // Fetch level data from class
          if (classData?.levelid) {
            try {
              const levelResponse = await levelAPI.getLevelById(classData.levelid);
              if (levelResponse.data.success) {
                let levelData = levelResponse.data.data;
                if (Array.isArray(levelData)) {
                  levelData = levelData[0];
                }
                levelInfo.value = levelData;
              }
            } catch (error) {
              console.error('Error fetching level:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching class:', error);
      }
    }

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

/** Download certificate */
const handleDownloadCertificate = async (gradeId, testType) => {
  try {
    const response = await gradeAPI.downloadCertificate(gradeId);
    
    // Create blob URL from response
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `Certificate_${testType || 'Test'}.pdf`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    showNotification('error', 'Failed to download certificate. Please try again.');
  }
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
        class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Students
      </button>
      <h1 class="text-2xl font-semibold text-slate-900 tracking-tight">Student Details</h1>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="py-20 flex justify-center">
      <LoadingSpinner size="lg" color="slate" :center="true" />
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="border border-red-200 rounded-lg p-6 text-center">
      <h3 class="text-sm font-semibold text-red-900 mb-1">Error Loading Data</h3>
      <p class="text-sm text-red-600 mb-4">{{ errorMessage }}</p>
      <BaseButton 
        variant="primary"
        @click="fetchStudentData"
      >
        Try Again
      </BaseButton>
    </div>

    <!-- Content -->
    <div v-else-if="student" class="space-y-8">
      <!-- Student Info Header -->
      <div class="flex items-start gap-6">
        <div class="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-xl font-semibold text-slate-700 flex-shrink-0">
          {{ getInitials(student.fullname) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold text-slate-900">{{ student.fullname }}</h2>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-500">
                <span>{{ student.tbuser?.email || 'No email' }}</span>
                <span class="text-slate-300">·</span>
                <span>{{ student.phone || 'No phone' }}</span>
                <span class="text-slate-300">·</span>
                <span>{{ classInfo?.class_code || 'No class' }}</span>
                <span class="text-slate-300">·</span>
                <span>{{ levelInfo?.name || 'No level' }}</span>
              </div>
            </div>
            <span class="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md flex-shrink-0">
              Student
            </span>
          </div>
        </div>
      </div>

      <!-- Payment History -->
      <div>
        <div class="flex items-baseline justify-between mb-4">
          <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Recent Payments</h2>
          <span class="text-xs text-slate-400 font-medium">Latest 5</span>
        </div>
        
        <div v-if="transactions.length === 0" class="py-12 text-center">
          <p class="text-sm text-slate-400">No payment records found</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ID</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Amount</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Payment Type</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="transaction in transactions" :key="transaction.paymentid">
                <td class="px-4 py-3 text-sm font-medium text-slate-900">#{{ transaction.paymentid }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ formatDate(transaction.created_at) }}</td>
                <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ transaction.amount ? `Rp ${transaction.amount.toLocaleString()}` : '-' }}</td>
                <td class="px-4 py-3">
                  <span class="text-sm text-slate-600 capitalize">{{ transaction.payment_type || '-' }}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded capitalize" :class="getStatusBadge(transaction.status)">
                    {{ transaction.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Edit Form -->
      <div>
        <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Edit Student Information</h2>
        
        <form @submit.prevent="handleSave" class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium text-slate-900">Account Details</h3>
              <BaseInput
                v-bind="getFieldProps('username')"
                label="Username"
                placeholder="Leave blank to keep current"
              />
              <BaseInput
                v-bind="getFieldProps('email')"
                type="email"
                label="Email"
                placeholder="Leave blank to keep current"
              />
              <BaseInput
                v-bind="getFieldProps('password')"
                type="password"
                label="Password"
                placeholder="Leave blank to keep current"
              />

              <h3 class="text-sm font-medium text-slate-900 pt-4">Personal Information</h3>
              <BaseInput
                v-bind="getFieldProps('fullname')"
                label="Full Name"
                required
              />
              <BaseSelect
                v-bind="getFieldProps('gender')"
                label="Gender"
                required
                :options="['Male', 'Female']"
              />
              <BaseInput
                v-bind="getFieldProps('birthdate')"
                type="date"
                label="Birth Date"
              />
              <BaseInput
                v-bind="getFieldProps('birthplace')"
                label="Birth Place"
              />
            </div>

            <!-- Right Column -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium text-slate-900">Contact Information</h3>
              <BaseInput
                v-bind="getFieldProps('phone')"
                type="tel"
                label="Phone"
              />
              <BaseTextarea
                v-bind="getFieldProps('address')"
                label="Address"
                :rows="3"
                resize="none"
              />

              <h3 class="text-sm font-medium text-slate-900 pt-4">Parent Information</h3>
              <BaseInput
                v-bind="getFieldProps('parentname')"
                label="Parent Name"
              />
              <BaseInput
                v-bind="getFieldProps('parentphone')"
                type="tel"
                label="Parent Phone"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <BaseButton type="submit" variant="primary" :loading="isSubmitting">
              Update Student
            </BaseButton>
          </div>
        </form>
      </div>

      <!-- Grades Section -->
      <div>
        <div class="flex items-baseline justify-between mb-4">
          <h2 class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Academic Performance</h2>
          <BaseButton
            variant="primary"
            @click="router.push({ name: 'AdminAddGrade', params: { userid: studentId } })"
          >
            Add Grade
          </BaseButton>
        </div>
        
        <div v-if="grades.length === 0" class="text-center py-16">
          <p class="text-sm text-slate-400">No grades recorded</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Test Type</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Listening</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Speaking</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Reading</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Writing</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Grammar</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Vocabulary</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Final</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="grade in grades" :key="grade.gradeid" class="hover:bg-slate-50 transition-colors">
                <td class="px-4 py-3 text-sm font-medium text-slate-900">{{ grade.test_type }}</td>
                <td class="px-4 py-3 text-center text-sm text-slate-600">{{ grade.listening_score || '-' }}</td>
                <td class="px-4 py-3 text-center text-sm text-slate-600">{{ grade.speaking_score || '-' }}</td>
                <td class="px-4 py-3 text-center text-sm text-slate-600">{{ grade.reading_score || '-' }}</td>
                <td class="px-4 py-3 text-center text-sm text-slate-600">{{ grade.writing_score || '-' }}</td>
                <td class="px-4 py-3 text-center text-sm text-slate-600">{{ grade.grammar_score || '-' }}</td>
                <td class="px-4 py-3 text-center text-sm text-slate-600">{{ grade.vocabulary_score || '-' }}</td>
                <td class="px-4 py-3 text-center text-sm font-semibold text-slate-900">{{ grade.final_score ?? '-' }}</td>
                <td class="px-4 py-3 text-sm text-slate-500">{{ formatDate(grade.date_taken) }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <BaseButton
                      size="sm"
                      variant="secondary"
                      @click="handleDownloadCertificate(grade.gradeid, grade.test_type)"
                    >
                      Certificate
                    </BaseButton>
                    <BaseButton
                      size="sm"
                      variant="secondary"
                      @click="router.push({ name: 'AdminEditGrade', params: { userid: studentId, gradeid: grade.gradeid } })"
                    >
                      Edit
                    </BaseButton>
                  </div>
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
    />
  </div>
</template>
