<script setup>
import { ref, computed, onMounted } from "vue";
import { authStore } from "../../store/auth";
import { useStudentProfile } from "../../composables/useStudentProfile";
import { useClassDetails } from "../../composables/useClassDetails";
import { useDashboardUtils } from "../../composables/useDashboardUtils";
import { courseAPI } from "../../services/api";
import IconArrowRight from "~icons/basil/arrow-right-solid";
import IconBookSolid from "~icons/basil/book-solid";
import IconCalendar from "~icons/basil/calendar-outline";
import { formatDate } from "../../utils/formatters";
import PageHeaderCard from "../../components/student/PageHeaderCard.vue";

const { studentProfile, fetchStudentProfile } = useStudentProfile();
const {
    greeting,
    getDashboardCourses,
    getPlaceholderImage,
    getCourseStatusText,
    getStatusBadgeClass,
} = useDashboardUtils();

onMounted(async () => {
    await fetchStudentProfile();
    await fetchCourses();
});

const classId = computed(() => studentProfile.value?.classid);
const {
    classInfo,
    levelName,
    lecturerName,
    isLoading: classLoading,
} = useClassDetails(classId);

const user = computed(() => ({
    name:
        studentProfile.value?.nama_lengkap ||
        studentProfile.value?.fullname ||
        authStore.user?.username ||
        authStore.user?.email?.split("@")[0] ||
        "Student",
}));

const DAY_TO_NUM = Object.freeze({
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Minggu: 0,
    Senin: 1,
    Selasa: 2,
    Rabu: 3,
    Kamis: 4,
    Jumat: 5,
    Sabtu: 6,
});

const MONTH_NAMES = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

const nextClassDetails = computed(() => {
    if (!classInfo.value) return null;
    const { schedule_day, schedule_time, schedule_day_2, schedule_time_2 } =
        classInfo.value;

    const today = new Date().getDay();
    const getDaysUntil = (dayStr) => {
        const num = DAY_TO_NUM[dayStr];
        if (num === undefined) return 999;
        return (num - today + 7) % 7 || 7;
    };

    const days1 = getDaysUntil(schedule_day);
    const days2 = getDaysUntil(schedule_day_2);

    let targetDay = null;
    let targetTime = null;
    let daysToAdd = 0;

    if (days1 < 999 || days2 < 999) {
        if (days1 <= days2) {
            targetDay = schedule_day;
            targetTime = schedule_time;
            daysToAdd = days1;
        } else {
            targetDay = schedule_day_2;
            targetTime = schedule_time_2;
            daysToAdd = days2;
        }
    }

    if (!targetDay) return null;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysToAdd);

    let timeStr = "";
    if (targetTime) {
        const [h, m] = targetTime.split(":");
        const endH = (parseInt(h, 10) + 2).toString().padStart(2, "0");
        timeStr = `${h}:${m} - ${endH}:${m}`;
    }

    return {
        date: targetDate.getDate(),
        month: MONTH_NAMES[targetDate.getMonth()],
        dayName: targetDay,
        timeRange: timeStr,
    };
});

const courses = ref([]);
const coursesLoading = ref(false);
const coursesError = ref(null);

const dashboardCourses = computed(() => getDashboardCourses(courses.value, 4));

const heroCourseFormattedDate = computed(() => {
    if (!dashboardCourses.value.length) return "";
    return formatDate(dashboardCourses.value[0].upload_date);
});

const fetchCourses = async () => {
    if (!studentProfile.value?.classid) return;

    coursesLoading.value = true;
    coursesError.value = null;

    try {
        const response = await courseAPI.getAllCourses();

        if (response.data.success) {
            const classid = studentProfile.value.classid;
            const filtered = response.data.data
                .filter((course) => course.classid === classid)
                .map((course) => ({
                    ...course,
                    _ts: new Date(course.upload_date).getTime(),
                }))
                .sort(
                    (a, b) =>
                        b._ts - a._ts || (b.courseid || 0) - (a.courseid || 0),
                );

            courses.value = filtered.map(({ _ts, ...course }) => course);
        }
    } catch (error) {
        coursesError.value = "Failed to load courses";
    } finally {
        coursesLoading.value = false;
    }
};

const courseLink = (courseId) => ({
    name: "StudentCourseDetail",
    params: { id: courseId },
});
</script>

<template>
    <div class="space-y-6">
        <PageHeaderCard
            :eyebrow="greeting + ','"
            :title="user.name"
            :description="'You have ' + courses.length + ' course' + (courses.length !== 1 ? 's' : '') + ' this semester.'"
            :show-decoration="true"
        />

        <section
            aria-label="Quick stats"
            class="grid grid-cols-2 gap-3 md:gap-4"
        >
            <!-- Next Class Card -->
            <UCard
                class="relative overflow-hidden ring-0 border-0 bg-sky-600 rounded-xl text-white shadow-sm flex flex-col min-h-[150px]"
                :ui="{ body: { base: 'flex-1 flex flex-col p-5 md:p-6' } }"
            >
                <div v-if="classLoading" class="flex-1 flex flex-col justify-end space-y-2 animate-pulse">
                    <div class="h-8 w-24 bg-white/20 rounded"></div>
                    <div class="h-4 w-32 bg-white/10 rounded"></div>
                </div>
                <template v-else-if="nextClassDetails">
                    <div class="flex items-start justify-between mb-4">
                        <IconCalendar class="w-5 h-5 text-sky-200" />
                        <span class="text-sky-100 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Next Class</span>
                    </div>
                    <div class="mt-auto">
                        <h3 class="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-white leading-none">
                            {{ nextClassDetails.dayName }}
                        </h3>
                        <div class="flex flex-col gap-1 text-sm font-medium text-sky-100">
                            <span>{{ nextClassDetails.date }} {{ nextClassDetails.month }}</span>
                            <span class="text-sky-200">{{ nextClassDetails.timeRange }}</span>
                        </div>
                    </div>
                </template>
                <div v-else class="flex-1 flex flex-col justify-end">
                    <span class="text-3xl font-black text-white/50 leading-none">—</span>
                    <span class="text-sm font-medium text-sky-200 mt-2 block">No schedule</span>
                </div>
            </UCard>

            <!-- Current Level Card -->
            <UCard
                class="relative overflow-hidden ring-0 border-0 bg-blue-800 rounded-xl text-white shadow-sm flex flex-col min-h-[150px]"
                :ui="{ body: { base: 'flex-1 flex flex-col p-5 md:p-6' } }"
            >
                <div v-if="classLoading" class="flex flex-col h-full justify-between animate-pulse">
                    <div>
                        <div class="h-3 w-16 bg-white/20 rounded mb-2.5"></div>
                        <div class="h-6 sm:h-8 w-32 bg-white/20 rounded"></div>
                    </div>
                    <div class="mt-6 border-t border-blue-700/50 pt-4 flex justify-between items-center">
                        <div class="h-4 w-16 bg-white/10 rounded"></div>
                        <div class="h-6 w-16 bg-white/20 rounded-md"></div>
                    </div>
                </div>
                <template v-else>
                    <div class="flex flex-col h-full justify-between">
                        <div>
                            <span class="text-blue-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider block mb-1.5">Program</span>
                            <h3 class="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug pr-4 line-clamp-2">
                                {{ levelName || "N/A" }}
                            </h3>
                        </div>
                        
                        <div class="mt-6 flex items-center justify-between border-t border-blue-700/50 pt-4">
                            <span class="text-sm font-medium text-blue-200 flex items-center gap-1.5">
                                <IconBookSolid class="w-4 h-4 text-blue-300" />
                                Status
                            </span>
                            <UBadge
                                :color="levelName ? 'emerald' : 'amber'"
                                variant="subtle"
                                class="bg-blue-900/50 border border-blue-700 text-white font-bold shadow-sm"
                                size="sm"
                            >
                                <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="levelName ? 'bg-emerald-400' : 'bg-amber-400'"></span>
                                {{ levelName ? 'Active' : 'Pending' }}
                            </UBadge>
                        </div>
                    </div>
                </template>
            </UCard>
        </section>

        <section aria-labelledby="courses-heading">
            <div
                class="bg-gray-50 rounded-xl md:rounded-xl p-5 md:p-8 border border-gray-200 shadow-sm"
            >
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2
                            id="courses-heading"
                            class="text-2xl font-bold text-gray-900"
                        >
                            My Courses
                        </h2>
                        <p class="text-sm text-gray-500 mt-1">
                            {{ courses.length }} course{{
                                courses.length !== 1 ? "s" : ""
                            }}
                        </p>
                    </div>
                    <router-link
                        to="/student/courses"
                        class="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md px-2 py-1 -mx-2 -my-1"
                        aria-label="View all courses"
                    >
                        View All
                        <IconArrowRight class="w-4 h-4" aria-hidden="true" />
                    </router-link>
                </div>

                <div
                    v-if="coursesLoading"
                    class="space-y-4 md:space-y-6 animate-pulse"
                    role="status"
                    aria-busy="true"
                >
                    <div
                        class="bg-blue-50 rounded-xl md:rounded-xl h-44 md:h-56"
                    ></div>
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
                    >
                        <div
                            class="bg-white rounded-xl md:rounded-xl border border-gray-200 overflow-hidden"
                        >
                            <div class="h-36 sm:h-32 md:h-40 bg-gray-100"></div>
                            <div class="p-3 md:p-4 h-16"></div>
                        </div>
                        <div
                            class="bg-white rounded-xl md:rounded-xl border border-gray-200 overflow-hidden"
                        >
                            <div class="h-36 sm:h-32 md:h-40 bg-gray-100"></div>
                            <div class="p-3 md:p-4 h-16"></div>
                        </div>
                        <div
                            class="bg-white rounded-xl md:rounded-xl border border-gray-200 overflow-hidden"
                        >
                            <div class="h-36 sm:h-32 md:h-40 bg-gray-100"></div>
                            <div class="p-3 md:p-4 h-16"></div>
                        </div>
                    </div>
                </div>

                <div
                    v-else-if="coursesError"
                    class="bg-red-50 border border-red-200 rounded-xl md:rounded-xl p-5 md:p-6 text-center"
                    role="alert"
                >
                    <p class="text-red-800 mb-4">{{ coursesError }}</p>
                    <button
                        @click="fetchCourses"
                        class="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                        aria-label="Retry loading courses"
                    >
                        Retry
                    </button>
                </div>

                <div
                    v-else-if="dashboardCourses.length === 0"
                    class="text-center py-12"
                    role="status"
                >
                    <IconBookSolid
                        class="w-16 h-16 mx-auto text-gray-500 mb-4"
                        aria-hidden="true"
                    />
                    <p class="text-gray-500 mb-3">
                        No course materials available yet.
                    </p>
                    <router-link
                        to="/student/courses"
                        class="text-sm font-medium text-blue-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md px-2 py-1"
                    >
                        Browse all courses
                    </router-link>
                </div>

                <div v-else class="space-y-4 md:space-y-6">
                    <router-link
                        :to="courseLink(dashboardCourses[0].courseid)"
                        custom
                        v-slot="{ navigate }"
                    >
                        <article
                            class="bg-blue-600 rounded-xl md:rounded-xl overflow-hidden shadow-md hover:shadow-lg active:shadow-sm transition-shadow duration-200 group relative cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
                            aria-labelledby="hero-course-title"
                            @click="navigate"
                            @keypress.enter="navigate"
                            role="link"
                            tabindex="0"
                        >
                            <div class="flex flex-col md:flex-row">
                                <div
                                    class="md:w-5/12 lg:w-2/5 h-44 md:h-auto relative overflow-hidden bg-blue-800"
                                >
                                    <img
                                        :src="getPlaceholderImage(0)"
                                        :alt="dashboardCourses[0].title"
                                        class="w-full h-full object-cover opacity-90"
                                        fetchpriority="high"
                                        decoding="async"
                                    />
                                    <span
                                        :class="
                                            getStatusBadgeClass(
                                                dashboardCourses[0],
                                            )
                                        "
                                        class="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-white text-xs font-semibold shadow-sm"
                                        aria-label="Course status"
                                    >
                                        {{
                                            getCourseStatusText(
                                                dashboardCourses[0],
                                            )
                                        }}
                                    </span>
                                </div>

                                <div
                                    class="p-4 md:p-6 lg:p-8 md:w-7/12 lg:w-3/5 flex flex-col justify-center"
                                >
                                    <div class="flex items-center gap-2 mb-2">
                                        <span
                                            class="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white"
                                            >Latest</span
                                        >
                                        <span
                                            class="text-xs text-blue-100 flex items-center gap-1 font-medium"
                                        >
                                            <IconCalendar
                                                class="w-3.5 h-3.5 md:w-4 md:h-4"
                                                aria-hidden="true"
                                            />
                                            {{ heroCourseFormattedDate }}
                                        </span>
                                    </div>
                                    <h3
                                        id="hero-course-title"
                                        class="text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 line-clamp-2"
                                    >
                                        {{ dashboardCourses[0].title }}
                                    </h3>
                                    <p
                                        class="text-blue-100/90 text-sm md:text-base mb-4 md:mb-6 line-clamp-2 max-w-xl"
                                    >
                                        Pick up where you left off.
                                    </p>

                                    <div class="mt-auto">
                                        <span
                                            class="inline-flex items-center gap-2 px-4 md:px-5 py-2 bg-white text-blue-600 text-sm font-bold rounded-full hover:bg-blue-50 transition-colors duration-200"
                                        >
                                            Open Course
                                            <IconArrowRight
                                                class="w-4 h-4"
                                                aria-hidden="true"
                                            />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </router-link>

                    <div
                        v-if="dashboardCourses.length > 1"
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"
                    >
                        <router-link
                            v-for="(course, index) in dashboardCourses.slice(1)"
                            :key="course.courseid"
                            :to="courseLink(course.courseid)"
                            custom
                            v-slot="{ navigate }"
                        >
                            <article
                                class="bg-white rounded-xl md:rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md active:shadow-sm transition-shadow duration-200 flex flex-col h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                @click="navigate"
                                @keypress.enter="navigate"
                                role="link"
                                tabindex="0"
                            >
                                <div
                                    class="h-36 sm:h-32 md:h-40 w-full relative overflow-hidden bg-gray-100"
                                >
                                    <img
                                        :src="getPlaceholderImage(index + 1)"
                                        :alt="course.title"
                                        class="w-full h-full object-cover"
                                        loading="lazy"
                                        decoding="async"
                                    />

                                    <div class="absolute top-2 left-2 z-10">
                                        <span
                                            :class="getStatusBadgeClass(course)"
                                            class="px-2 py-0.5 rounded-full text-white text-xs font-semibold shadow-sm"
                                        >
                                            {{ getCourseStatusText(course) }}
                                        </span>
                                    </div>
                                </div>

                                <div
                                    class="p-3 md:p-4 flex flex-col flex-grow justify-between"
                                >
                                    <div>
                                        <h3
                                            class="text-sm md:text-base font-bold text-gray-900 mb-1 line-clamp-2 leading-tight"
                                        >
                                            {{ course.title }}
                                        </h3>
                                    </div>

                                    <div
                                        class="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-2"
                                    >
                                        <div
                                            class="flex items-center gap-1.5 text-xs text-gray-500 font-medium min-w-0"
                                        >
                                            <IconCalendar
                                                class="w-3.5 h-3.5 text-gray-500 flex-shrink-0"
                                            />
                                            <span class="truncate">{{
                                                formatDate(course.upload_date)
                                            }}</span>
                                        </div>
                                        <span
                                            class="text-xs font-semibold text-blue-600 flex items-center gap-1 flex-shrink-0"
                                        >
                                            Open
                                            <IconArrowRight class="w-3 h-3" />
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </router-link>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
    .animate-pulse {
        animation: none;
        opacity: 0.5;
    }
}
</style>
