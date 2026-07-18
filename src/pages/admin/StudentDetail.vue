<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { studentAPI, gradeAPI, paymentAPI, classAPI, levelAPI } from '../../services/api';


import { useToast } from '@nuxt/ui/composables';
import { formatDate, getInitials, calculateAge, formatCurrency, getStatusBadge } from '../../utils/formatters';

const route = useRoute();
const router = useRouter();
const studentId = route.params.id;

const toast = useToast();
const student = ref(null);
const classInfo = ref(null);
const levelInfo = ref(null);
const grades = ref([]);
const transactions = ref([]);
const isLoading = ref(true);
const errorMessage = ref('');



/** Get gender display */
const getGenderDisplay = (code) => {
  if (code === 'L') return 'Male';
  if (code === 'P') return 'Female';
  return '-';
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

    <!-- Loading skeleton -->
    <div v-if="isLoading" class="space-y-8">
      <div class="flex items-start gap-6">
        <USkeleton class="w-16 h-16 rounded-lg" />
        <div class="flex-1 space-y-2">
          <USkeleton class="h-6 w-64" />
          <USkeleton class="h-4 w-96" />
        </div>
      </div>
      <div class="space-y-3">
        <USkeleton class="h-4 w-32" />
        <div v-for="i in 3" :key="i" class="flex gap-4 py-3 border-b border-muted">
          <USkeleton class="h-4 w-12" />
          <USkeleton class="h-4 w-28" />
          <USkeleton class="h-4 w-20" />
          <USkeleton class="h-4 w-24" />
          <USkeleton class="h-4 w-16" />
        </div>
      </div>
      <div class="grid grid-cols-3 gap-6">
        <div v-for="i in 3" :key="i" class="space-y-3">
          <USkeleton class="h-4 w-32" />
          <div v-for="j in 4" :key="j" class="flex justify-between">
            <USkeleton class="h-3 w-20" />
            <USkeleton class="h-3 w-24" />
          </div>
        </div>
      </div>
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
                <td class="px-4 py-3 text-sm font-medium text-default">{{ transaction.amount ? formatCurrency(transaction.amount) : '-' }}</td>
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

      <!-- Student record -->
      <section class="border-y border-default py-6">
        <div class="flex items-baseline justify-between gap-4 mb-5">
          <h2 class="text-xs font-semibold text-muted uppercase tracking-widest">Student Record</h2>
          <span class="text-xs text-muted">Read-only profile</span>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div class="space-y-3">
            <h3 class="text-sm font-medium text-default">Identity & account</h3>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between gap-4"><dt class="text-muted">Username</dt><dd class="text-right text-default">{{ student.tbuser?.username || '-' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Gender</dt><dd class="text-right text-default">{{ getGenderDisplay(student.gender) }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Birth</dt><dd class="text-right text-default">{{ student.birthplace || '-' }}, {{ formatDate(student.birthdate) }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Age</dt><dd class="text-right text-default">{{ calculateAge(student.birthdate) ?? '-' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Occupation</dt><dd class="text-right text-default">{{ student.occupation || '-' }}</dd></div>
            </dl>
          </div>

          <div class="space-y-3">
            <h3 class="text-sm font-medium text-default">Enrollment</h3>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between gap-4"><dt class="text-muted">Class</dt><dd class="text-right text-default">{{ classInfo?.class_code || 'Unassigned' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Level</dt><dd class="text-right text-default">{{ levelInfo?.name || '-' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Payment plan</dt><dd class="text-right capitalize text-default">{{ student.payment_type || '-' }}</dd></div>
            </dl>
          </div>

          <div class="space-y-3">
            <h3 class="text-sm font-medium text-default">Emergency contact</h3>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between gap-4"><dt class="text-muted">Full name</dt><dd class="text-right text-default">{{ student.parentname || '-' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Relationship</dt><dd class="text-right text-default">{{ student.relationship || '-' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Phone number</dt><dd class="text-right text-default">{{ student.parentphone || '-' }}</dd></div>
              <div><dt class="text-muted mb-1">Address</dt><dd class="text-default">{{ student.address || '-' }}</dd></div>
            </dl>
          </div>

          <div class="space-y-3">
            <h3 class="text-sm font-medium text-default">Course intake</h3>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between gap-4"><dt class="text-muted">Program</dt><dd class="text-right text-default">{{ student.program_interest || '-' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">English level</dt><dd class="text-right text-default">{{ student.english_level || '-' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Studied before</dt><dd class="text-right text-default">{{ student.studied_before || '-' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Learning reason</dt><dd class="text-right text-default">{{ student.learning_reason || '-' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Learning mode</dt><dd class="text-right text-default">{{ student.learning_mode || '-' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Preferred time</dt><dd class="text-right text-default">{{ student.preferred_time || '-' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Referral source</dt><dd class="text-right text-default">{{ student.referral_source || '-' }}</dd></div>
            </dl>
          </div>
        </div>
      </section>

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
