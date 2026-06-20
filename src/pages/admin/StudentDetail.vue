<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { studentAPI, gradeAPI, paymentAPI, userAPI, classAPI, levelAPI } from '../../services/api';
import { useForm } from '../../composables/useForm';


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
  return classes[status] || 'bg-muted text-default border-default';
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

      toast.add({ title: 'Success', description: 'Student updated successfully!', color: 'success' });
      fetchStudentData(); // Refresh data
    } catch (error) {
      toast.add({ title: 'Error', description: error.response?.data?.message || 'Failed to save student.', color: 'error' });
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
    toast.add({ title: 'Error', description: 'Failed to download certificate. Please try again.', color: 'error' });
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
        class="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-default transition-colors"
      >
        <UIcon name="i-lucide-arrow-left" class="w-4 h-4" />
        Back to Students
      </button>
      <h1 class="text-2xl font-semibold text-default tracking-tight">Student Details</h1>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="flex justify-center py-16">
      <UIcon name="i-lucide-loader-circle" class="w-8 h-8 animate-spin text-muted" />
    </div>

    <!-- Error -->
    <div v-else-if="errorMessage" class="border border-red-200 rounded-lg p-6 text-center">
      <h3 class="text-sm font-semibold text-red-900 mb-1">Error Loading Data</h3>
      <p class="text-sm text-red-600 mb-4">{{ errorMessage }}</p>
      <UButton color="primary" variant="solid" @click="fetchStudentData">
        Try Again
      </UButton>
    </div>

    <!-- Content -->
    <div v-else-if="student" class="space-y-8">
      <!-- Student Info Header -->
      <div class="flex items-start gap-6">
        <div class="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-xl font-semibold text-default flex-shrink-0">
          {{ getInitials(student.fullname) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold text-default">{{ student.fullname }}</h2>
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted">
                <span>{{ student.tbuser?.email || 'No email' }}</span>
                <span class="text-muted">·</span>
                <span>{{ student.phone || 'No phone' }}</span>
                <span class="text-muted">·</span>
                <span>{{ classInfo?.class_code || 'No class' }}</span>
                <span class="text-muted">·</span>
                <span>{{ levelInfo?.name || 'No level' }}</span>
              </div>
            </div>
            <span class="text-xs font-medium text-muted bg-muted px-2.5 py-1 rounded-md flex-shrink-0">
              Student
            </span>
          </div>
        </div>
      </div>

      <!-- Payment History -->
      <div>
        <div class="flex items-baseline justify-between mb-4">
          <h2 class="text-xs font-semibold text-muted uppercase tracking-widest">Recent Payments</h2>
          <span class="text-xs text-muted font-medium">Latest 5</span>
        </div>
        
        <div v-if="transactions.length === 0" class="py-12 text-center">
          <p class="text-sm text-muted">No payment records found</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-default">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">ID</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Amount</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Payment Type</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-muted">
              <tr v-for="transaction in transactions" :key="transaction.paymentid">
                <td class="px-4 py-3 text-sm font-medium text-default">#{{ transaction.paymentid }}</td>
                <td class="px-4 py-3 text-sm text-toned">{{ formatDate(transaction.created_at) }}</td>
                <td class="px-4 py-3 text-sm font-medium text-default">{{ transaction.amount ? `Rp ${transaction.amount.toLocaleString()}` : '-' }}</td>
                <td class="px-4 py-3">
                  <span class="text-sm text-toned capitalize">{{ transaction.payment_type || '-' }}</span>
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
        <h2 class="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Edit Student Information</h2>
        
        <form @submit.prevent="handleSave" class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium text-default">Account Details</h3>
              <UFormField label="Username">
                <UInput v-bind="getFieldProps('username')" placeholder="Leave blank to keep current" class="w-full" />
              </UFormField>
              <UFormField label="Email">
                <UInput v-bind="getFieldProps('email')" type="email" placeholder="Leave blank to keep current" class="w-full" />
              </UFormField>
              <UFormField label="Password">
                <UInput v-bind="getFieldProps('password')" type="password" placeholder="Leave blank to keep current" class="w-full" />
              </UFormField>

              <h3 class="text-sm font-medium text-default pt-4">Personal Information</h3>
              <UFormField label="Full Name" required>
                <UInput v-bind="getFieldProps('fullname')" class="w-full" />
              </UFormField>
              <UFormField label="Gender" required>
                <USelect v-bind="getFieldProps('gender')" :items="['Male', 'Female']" class="w-full" />
              </UFormField>
              <UFormField label="Birth Date">
                <UInput v-bind="getFieldProps('birthdate')" type="date" class="w-full" />
              </UFormField>
              <UFormField label="Birth Place">
                <UInput v-bind="getFieldProps('birthplace')" class="w-full" />
              </UFormField>
            </div>

            <!-- Right Column -->
            <div class="space-y-4">
              <h3 class="text-sm font-medium text-default">Contact Information</h3>
              <UFormField label="Phone">
                <UInput v-bind="getFieldProps('phone')" type="tel" class="w-full" />
              </UFormField>
              <UFormField label="Address">
                <UTextarea v-bind="getFieldProps('address')" :rows="3" class="w-full" />
              </UFormField>

              <h3 class="text-sm font-medium text-default pt-4">Parent Information</h3>
              <UFormField label="Parent Name">
                <UInput v-bind="getFieldProps('parentname')" class="w-full" />
              </UFormField>
              <UFormField label="Parent Phone">
                <UInput v-bind="getFieldProps('parentphone')" type="tel" class="w-full" />
              </UFormField>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-6 border-t border-default">
            <UButton type="submit" color="primary" variant="solid" :loading="isSubmitting">
              Update Student
            </UButton>
          </div>
        </form>
      </div>

      <!-- Grades Section -->
      <div>
        <div class="flex items-baseline justify-between mb-4">
          <h2 class="text-xs font-semibold text-muted uppercase tracking-widest">Academic Performance</h2>
          <UButton
            color="primary"
            variant="solid"
            icon="i-lucide-plus"
            @click="router.push({ name: 'AdminAddGrade', params: { userid: studentId } })"
          >
            Add Grade
          </UButton>
        </div>
        
        <div v-if="grades.length === 0" class="text-center py-16">
          <p class="text-sm text-muted">No grades recorded</p>
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-default">
            <thead>
              <tr>
                <th class="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Test Type</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-muted uppercase">Listening</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-muted uppercase">Speaking</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-muted uppercase">Reading</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-muted uppercase">Writing</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-muted uppercase">Grammar</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-muted uppercase">Vocabulary</th>
                <th class="px-4 py-3 text-center text-xs font-semibold text-muted uppercase">Final</th>
                <th class="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Date</th>
                <th class="px-4 py-3 text-right text-xs font-semibold text-muted uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-muted">
              <tr v-for="grade in grades" :key="grade.gradeid" class="hover:bg-elevated transition-colors">
                <td class="px-4 py-3 text-sm font-medium text-default">{{ grade.test_type }}</td>
                <td class="px-4 py-3 text-center text-sm text-toned">{{ grade.listening_score || '-' }}</td>
                <td class="px-4 py-3 text-center text-sm text-toned">{{ grade.speaking_score || '-' }}</td>
                <td class="px-4 py-3 text-center text-sm text-toned">{{ grade.reading_score || '-' }}</td>
                <td class="px-4 py-3 text-center text-sm text-toned">{{ grade.writing_score || '-' }}</td>
                <td class="px-4 py-3 text-center text-sm text-toned">{{ grade.grammar_score || '-' }}</td>
                <td class="px-4 py-3 text-center text-sm text-toned">{{ grade.vocabulary_score || '-' }}</td>
                <td class="px-4 py-3 text-center text-sm font-semibold text-default">{{ grade.final_score ?? '-' }}</td>
                <td class="px-4 py-3 text-sm text-muted">{{ formatDate(grade.date_taken) }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <UButton
                      size="sm"
                      color="neutral"
                      variant="soft"
                      @click="handleDownloadCertificate(grade.gradeid, grade.test_type)"
                    >
                      Certificate
                    </UButton>
                      <UButton
                        size="sm"
                        color="primary"
                        variant="solid"
                        @click="router.push({ name: 'AdminEditGrade', params: { userid: studentId, gradeid: grade.gradeid } })"
                      >
                        Edit
                      </UButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>


  </div>
</template>
