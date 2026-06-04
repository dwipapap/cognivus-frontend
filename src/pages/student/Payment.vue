<script setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from "vue";
import { authStore } from "../../store/auth";
import { useStudentProfile } from "../../composables/useStudentProfile";
import { useClassDetails } from "../../composables/useClassDetails";
import { useSnapPayment } from "../../composables/useSnapPayment";
import { paymentAPI, priceAPI, ancillaryPriceAPI } from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/formatters";
import IconQuestionCircle from "~icons/solar/question-circle-broken";
import IconInfo from "~icons/basil/info-circle-outline";
import IconClose from "~icons/solar/close-circle-bold";
import Modal from "../../components/ui/Modal.vue";
import BaseButton from "../../components/ui/BaseButton.vue";
import ProgramBillingCard from "../../components/student/ProgramBillingCard.vue";
import PaymentHistoryTable from "../../components/student/PaymentHistoryTable.vue";
import PaymentOptionCard from "../../components/student/PaymentOptionCard.vue";
import PageHeaderCard from "../../components/student/PageHeaderCard.vue";

// Composables
const {
    studentProfile,
    isLoading: isProfileLoading,
    fetchStudentProfile,
} = useStudentProfile();
const classId = computed(() => studentProfile.value?.classid);
const {
    classInfo,
    levelName,
    programName,
    isLoading: isClassLoading,
} = useClassDetails(classId);
const {
    pay,
    isLoading: isPaymentLoading,
    error: paymentError,
    paymentStatus,
    resetPaymentState,
} = useSnapPayment();

const hideMobileNav = inject("hideMobileNav");

// State
const selectedPaymentType = ref(null);
const prices = ref([]);
const isPricesLoading = ref(true);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const showGuideModal = ref(false);
const showMobilePaymentSummary = ref(false);
const isHistoryLoading = ref(false);
const paymentHistory = ref([]);
const ancillaryPrices = ref([]);
const isAncillaryLoading = ref(true);

// Pagination state
const currentPage = ref(1);
const itemsPerPage = 10;

// Payment types: regular (semester, monthly) + dynamic ancillary
const regularPaymentTypes = [
    {
        id: "semester",
        name: "Pay Per Semester",
        description: "Full payment for one semester",
        icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
        category: "regular",
    },
    {
        id: "monthly",
        name: "Pay Per Month",
        description: "Payment for this month",
        icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
        category: "regular",
    },
];

/** Ancillary payment types from database */
const ancillaryPaymentTypes = computed(() => {
    return ancillaryPrices.value.map((item) => ({
        id: `ancillary_${item.apid}`,
        name: item.name,
        description: item.description || "",
        icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
        category: "ancillary",
        price: item.price,
    }));
});

// Computed
const selectedAmount = computed(() => {
    if (!selectedPaymentType.value) return 0;

    if (selectedPaymentType.value === "semester") {
        return currentSemesterFee.value;
    } else if (selectedPaymentType.value === "monthly") {
        return currentMonthlyFee.value;
    } else if (selectedPaymentType.value.startsWith("ancillary_")) {
        const item = ancillaryPaymentTypes.value.find(
            (t) => t.id === selectedPaymentType.value,
        );
        return item?.price || 0;
    }

    return 0;
});

const studentName = computed(() => {
    return (
        studentProfile.value?.nama_lengkap ||
        studentProfile.value?.fullname ||
        authStore.user?.username ||
        "Student"
    );
});

const studentEmail = computed(() => {
    return studentProfile.value?.email || authStore.user?.email || "";
});

const currentSemesterFee = computed(() => {
    if (!classInfo.value?.levelid || prices.value.length === 0) {
        return prices.value[0]?.harga || 0;
    }

    // Find price matching the student's level
    const matchingPrice = prices.value.find(
        (p) => p.levelid === classInfo.value.levelid,
    );

    if (matchingPrice) {
        return matchingPrice.harga || 0;
    }

    // Fallback to first available price
    return prices.value[0]?.harga || 0;
});

const currentMonthlyFee = computed(() => {
    if (!classInfo.value?.levelid || prices.value.length === 0) {
        return prices.value[0]?.monthlyprice || 0;
    }

    // Find price matching the student's level
    const matchingPrice = prices.value.find(
        (p) => p.levelid === classInfo.value.levelid,
    );

    if (matchingPrice) {
        return matchingPrice.monthlyprice || 0;
    }

    // Fallback to first available price
    return prices.value[0]?.monthlyprice || 0;
});

/** Fetch ancillary prices from API */
const fetchAncillaryPrices = async () => {
    try {
        isAncillaryLoading.value = true;
        const response = await ancillaryPriceAPI.getAll();
        if (response.data?.success && response.data?.data) {
            ancillaryPrices.value = response.data.data;
        }
    } catch (err) {
        console.error("Failed to fetch ancillary prices:", err);
    } finally {
        isAncillaryLoading.value = false;
    }
};

const canPay = computed(() => {
    return (
        selectedPaymentType.value &&
        selectedAmount.value > 0 &&
        !isPaymentLoading.value
    );
});

// Methods
const fetchPrices = async () => {
    try {
        isPricesLoading.value = true;
        const response = await priceAPI.getAllPrices();

        if (response.data?.success && response.data?.data) {
            prices.value = response.data.data;
        } else if (response.data) {
            // Handle case where data might be directly in response.data
            prices.value = Array.isArray(response.data)
                ? response.data
                : [response.data];
        }
    } catch (err) {
        console.error("Failed to fetch prices:", err);
    } finally {
        isPricesLoading.value = false;
    }
};

const selectPaymentType = (typeId) => {
    selectedPaymentType.value = typeId;
    resetPaymentState();
};

const handlePayment = async () => {
    if (!canPay.value) return;

    try {
        resetPaymentState();

        const paymentData = {
            email: studentEmail.value,
            amount: selectedAmount.value,
            name: studentName.value,
            studentid:
                studentProfile.value?.studentid || authStore.user?.userid,
            payment_type: selectedPaymentType.value,
        };

        // Generate token from backend
        const response = await paymentAPI.generateToken(paymentData);

        if (!response.data?.success || !response.data?.token) {
            throw new Error("Failed to generate payment token");
        }

        const { token, order_id } = response.data;

        // Trigger Snap payment
        await pay(token, {
            onSuccess: (result) => {
                showSuccessModal.value = true;
                fetchPaymentHistory();
                selectedPaymentType.value = null;
            },
            onPending: (result) => {
                fetchPaymentHistory();
            },
            onError: (result) => {
                showErrorModal.value = true;
            },
            onClose: () => {
                fetchPaymentHistory();
            },
        });
    } catch (err) {
        console.error("Payment error:", err);
        showErrorModal.value = true;
    }
};

const closeSuccessModal = () => {
    showSuccessModal.value = false;
};

const closeErrorModal = () => {
    showErrorModal.value = false;
};

const openGuideModal = () => {
    showGuideModal.value = true;
};

const closeGuideModal = () => {
    showGuideModal.value = false;
};

const getPaymentTypeName = (typeId) => {
    const regular = regularPaymentTypes.find((t) => t.id === typeId);
    if (regular) return regular.name;
    const ancillary = ancillaryPaymentTypes.value.find((t) => t.id === typeId);
    return ancillary?.name || typeId;
};

const fetchPaymentHistory = async () => {
    try {
        isHistoryLoading.value = true;
        // Wait for student profile to be available
        const studentid =
            studentProfile.value?.studentid || authStore.user?.userid;

        if (!studentid) {
            return;
        }

        const response = await paymentAPI.getPaymentHistory(studentid);

        if (response.data?.success && response.data?.data) {
            paymentHistory.value = Array.isArray(response.data.data)
                ? response.data.data
                : [];
            currentPage.value = 1; // Reset to first page
        } else {
            paymentHistory.value = [];
        }
    } catch (err) {
        console.error("Failed to fetch payment history:", err);
        paymentHistory.value = [];
    } finally {
        isHistoryLoading.value = false;
    }
};

const handleRefreshHistory = async () => {
    try {
        isHistoryLoading.value = true;
        const studentid =
            studentProfile.value?.studentid || authStore.user?.userid;

        if (!studentid) {
            return;
        }

        // First, refresh payment status from Midtrans
        await paymentAPI.refreshPaymentStatus(studentid);

        // Then fetch updated payment history
        await fetchPaymentHistory();
    } catch (err) {
        console.error("Failed to refresh payment history:", err);
        // Still try to fetch history even if refresh fails
        await fetchPaymentHistory();
    }
};

// Fetch history when student profile is available
watch(
    () => studentProfile.value?.studentid,
    (id) => {
        if (id) {
            fetchPaymentHistory();
        }
    },
);

watch(
    selectedPaymentType,
    (val) => {
        if (hideMobileNav) hideMobileNav.value = val !== null;
    },
    { immediate: true }
);

onUnmounted(() => {
    if (hideMobileNav) hideMobileNav.value = false;
});

// Lifecycle
onMounted(async () => {
    await fetchStudentProfile();
    fetchPrices();
    fetchAncillaryPrices();
    // Payment history is fetched reactively when studentProfile.studentid resolves
});
</script>

<template>
    <div class="space-y-6">
        <!-- Page Header - Clean Blue Gradient -->
        <PageHeaderCard
          title="Payment"
          description="Manage your course payments securely"
          :show-decoration="true"
        >
          <template #action>
            <button
                @click="openGuideModal"
                class="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 text-white px-5 py-2.5 rounded-full transition-all duration-200 border border-white/20"
            >
                <IconQuestionCircle class="w-5 h-5" />
                <span class="text-sm font-medium">Payment Guide</span>
            </button>
          </template>
        </PageHeaderCard>

        <!-- Program & Billing Information (Mobile: Top, Desktop: Right) -->
        <div class="lg:hidden">
            <ProgramBillingCard
                :program-name="programName"
                :level-name="levelName"
                :semester-fee="currentSemesterFee"
                :monthly-fee="currentMonthlyFee"
                :loading="isClassLoading || isPricesLoading"
                :format-currency="formatCurrency"
            />
        </div>

        <!-- Main Grid Layout: 2 columns on desktop -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- LEFT COLUMN: Payment Types & History (spans 2 cols on desktop) -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Payment Options Card (Always first) -->
                <div
                    class="payment-section-glass rounded-xl md:rounded-xl px-4 py-5 md:p-6 shadow-md border border-gray-200"
                >
                    <h2
                        class="text-base md:text-lg font-bold text-gray-800 mb-4 md:mb-5"
                    >
                        Payment Options
                    </h2>

                    <!-- Regular Payments Section -->
                    <div class="mb-4 md:mb-5">
                        <h3
                            class="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3"
                        >
                            Regular Payments
                        </h3>

                        <div
                            v-if="isPricesLoading"
                            class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4"
                        >
                            <div v-for="i in 2" :key="i" class="animate-pulse">
                                <div
                                    class="h-24 md:h-28 bg-gray-100 rounded-lg"
                                ></div>
                            </div>
                        </div>

                        <div
                            v-else
                            class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4"
                        >
                            <PaymentOptionCard
                                v-for="type in regularPaymentTypes"
                                :key="type.id"
                                :selected="selectedPaymentType === type.id"
                                :name="type.name"
                                :description="type.description"
                                :price="
                                    type.id === 'semester'
                                        ? currentSemesterFee
                                        : currentMonthlyFee
                                "
                                :icon-path="type.icon"
                                variant="regular"
                                :format-currency="formatCurrency"
                                @select="selectPaymentType(type.id)"
                            />
                        </div>
                    </div>

                    <!-- Divider -->
                    <div class="border-t border-gray-100 my-4 md:my-5"></div>

                    <!-- Additional Fees Section (Dynamic from database) -->
                    <div>
                        <h3
                            class="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3"
                        >
                            Additional Fees
                        </h3>

                        <div v-if="isAncillaryLoading" class="animate-pulse">
                            <div
                                class="h-24 md:h-28 bg-gray-100 rounded-lg"
                            ></div>
                        </div>

                        <div
                            v-else-if="ancillaryPaymentTypes.length === 0"
                            class="text-center py-5 md:py-6 text-gray-400 text-sm"
                        >
                            No additional fees available
                        </div>

                        <div
                            v-else
                            class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4"
                        >
                            <PaymentOptionCard
                                v-for="type in ancillaryPaymentTypes"
                                :key="type.id"
                                :selected="selectedPaymentType === type.id"
                                :name="type.name"
                                :description="type.description"
                                :price="type.price"
                                :icon-path="type.icon"
                                variant="ancillary"
                                :format-currency="formatCurrency"
                                @select="selectPaymentType(type.id)"
                            />
                        </div>
                    </div>
                </div>

                <!-- Payment History (Desktop Only) -->
                <div class="hidden lg:block">
                    <PaymentHistoryTable
                        :payments="paymentHistory"
                        :loading="isHistoryLoading"
                        :current-page="currentPage"
                        :items-per-page="itemsPerPage"
                        :get-payment-type-name="getPaymentTypeName"
                        :format-currency="formatCurrency"
                        :format-date="formatDate"
                        @refresh="handleRefreshHistory"
                        @page-change="currentPage = $event"
                    />
                </div>
            </div>

            <!-- RIGHT COLUMN: Program Info & Payment Summary (spans 1 col on desktop) -->
            <div class="lg:col-span-1 space-y-6">
                <!-- Program & Billing Information (Desktop Only) -->
                <div class="hidden lg:block">
                    <ProgramBillingCard
                        :program-name="programName"
                        :level-name="levelName"
                        :semester-fee="currentSemesterFee"
                        :monthly-fee="currentMonthlyFee"
                        :loading="isClassLoading || isPricesLoading"
                        :format-currency="formatCurrency"
                    />
                </div>

                <!-- Payment Summary (Desktop) -->
                <div class="hidden lg:block">
                    <div
                        class="payment-section-glass rounded-xl p-5 shadow-md border border-gray-200"
                    >
                        <h2 class="text-lg font-bold text-gray-800 mb-4">
                            Payment Summary
                        </h2>

                        <div class="space-y-3 mb-5">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-500">Name</span>
                                <span
                                    class="text-sm font-semibold text-gray-800 truncate ml-2 max-w-[60%] text-right"
                                    >{{ studentName }}</span
                                >
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-500">Email</span>
                                <span
                                    class="text-sm font-semibold text-gray-800 truncate ml-2 max-w-[60%] text-right"
                                    >{{ studentEmail }}</span
                                >
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-500"
                                    >Payment Type</span
                                >
                                <span
                                    class="text-sm font-semibold text-gray-800"
                                    >{{
                                        selectedPaymentType
                                            ? getPaymentTypeName(
                                                  selectedPaymentType,
                                              )
                                            : "-"
                                    }}</span
                                >
                            </div>
                            <div class="h-px bg-gray-100 my-3"></div>
                            <div
                                v-if="selectedPaymentType"
                                class="flex items-start gap-2 bg-blue-50 rounded-lg p-3 border border-blue-100 mb-3"
                            >
                                <IconInfo
                                    class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"
                                />
                                <p class="text-xs text-blue-700">
                                    Please verify the details above before
                                    confirming
                                </p>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="text-base font-bold text-gray-800"
                                    >Total</span
                                >
                                <span
                                    class="text-2xl font-bold text-blue-600"
                                    >{{
                                        selectedPaymentType
                                            ? formatCurrency(selectedAmount)
                                            : "Rp 0"
                                    }}</span
                                >
                            </div>
                        </div>

                        <BaseButton
                            variant="primary"
                            size="lg"
                            block
                            :disabled="!canPay"
                            :loading="isPaymentLoading"
                            @click="handlePayment"
                        >
                            {{
                                canPay ? "Confirm & Pay" : "Select Payment Type"
                            }}
                        </BaseButton>

                        <p class="text-xs text-gray-400 text-center mt-3">
                            {{
                                canPay
                                    ? "Secure payment powered by Midtrans"
                                    : "Choose a payment option to continue"
                            }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Mobile: Floating payment action bar -->
        <Transition name="slide-up">
            <div
                v-if="selectedPaymentType"
                class="fixed bottom-4 left-4 right-4 z-40 bg-white border border-gray-200 rounded-3xl px-5 py-3 shadow-xl lg:hidden"
            >
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="flex flex-col">
                            <p class="text-xs text-gray-500">Total</p>
                            <p class="text-lg font-bold text-blue-600">
                                {{ formatCurrency(selectedAmount) }}
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <BaseButton
                            variant="primary"
                            size="md"
                            @click="showMobilePaymentSummary = true"
                        >
                            Review Payment
                        </BaseButton>
                        <button
                            @click="selectPaymentType(null)"
                            class="flex items-center justify-center w-9 h-9 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            aria-label="Cancel payment selection"
                        >
                            <IconClose class="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

        <!-- Mobile: Payment Summary Drawer -->
        <UDrawer
            v-model:open="showMobilePaymentSummary"
            title="Payment Summary"
            class="lg:hidden"
            :ui="{ footer: 'px-4 pb-6 pt-2', body: 'px-4' }"
        >
            <template #body>
                <div class="space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">Name</span>
                        <span
                            class="text-sm font-semibold text-gray-800 truncate ml-2 max-w-[60%] text-right"
                            >{{ studentName }}</span
                        >
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">Email</span>
                        <span
                            class="text-sm font-semibold text-gray-800 truncate ml-2 max-w-[60%] text-right"
                            >{{ studentEmail }}</span
                        >
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">Payment Type</span>
                        <span class="text-sm font-semibold text-gray-800">{{
                            selectedPaymentType
                                ? getPaymentTypeName(selectedPaymentType)
                                : "-"
                        }}</span>
                    </div>
                    <div class="h-px bg-gray-100"></div>
                    <div
                        v-if="selectedPaymentType"
                        class="flex items-start gap-2 bg-blue-50 rounded-lg p-3 border border-blue-100"
                    >
                        <IconInfo
                            class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5"
                        />
                        <p class="text-xs text-blue-700">
                            Please verify the details above before confirming
                        </p>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-base font-bold text-gray-800"
                            >Total</span
                        >
                        <span class="text-2xl font-bold text-blue-600">{{
                            formatCurrency(selectedAmount)
                        }}</span>
                    </div>
                </div>
            </template>
            <template #footer="{ close }">
                <BaseButton
                    variant="primary"
                    size="lg"
                    block
                    :disabled="!canPay"
                    :loading="isPaymentLoading"
                    @click="handlePayment"
                >
                    {{ canPay ? "Confirm & Pay" : "Select Payment Type" }}
                </BaseButton>
                <p class="text-xs text-gray-400 text-center mt-2">
                    {{
                        canPay
                            ? "Secure payment powered by Midtrans"
                            : "Choose a payment option to continue"
                    }}
                </p>
            </template>
        </UDrawer>

        <!-- Payment History (Mobile Only) -->
        <div class="lg:hidden">
            <PaymentHistoryTable
                :payments="paymentHistory"
                :loading="isHistoryLoading"
                :current-page="currentPage"
                :items-per-page="itemsPerPage"
                :get-payment-type-name="getPaymentTypeName"
                :format-currency="formatCurrency"
                :format-date="formatDate"
                @refresh="handleRefreshHistory"
                @page-change="currentPage = $event"
            />
        </div>

        <!-- Success Modal -->
        <Modal
            :show="showSuccessModal"
            type="success"
            title="Payment Successful!"
            message="Your transaction has been processed successfully."
            @close="closeSuccessModal"
            @confirm="closeSuccessModal"
        />

        <!-- Error Modal -->
        <Modal
            :show="showErrorModal"
            type="error"
            title="Payment Failed"
            :message="
                paymentError ||
                'An error occurred while processing the payment.'
            "
            @close="closeErrorModal"
            @confirm="closeErrorModal"
        />

        <!-- Payment Guide Modal -->
        <Modal
            :show="showGuideModal"
            type="info"
            title="Payment Guide"
            size="2xl"
            :hide-footer="true"
            @close="closeGuideModal"
        >
            <template #content>
                <div class="space-y-4">
                    <!-- Step 1: Info -->
                    <div
                        class="guide-step-card flex items-start gap-4 p-5 bg-blue-50 border border-blue-100 rounded-lg"
                    >
                        <div
                            class="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base shadow-sm"
                        >
                            1
                        </div>
                        <div class="flex-1">
                            <h4
                                class="text-sm font-bold text-gray-800 mb-2 leading-tight"
                            >
                                Payment Confirmation Time
                            </h4>
                            <p class="text-sm text-gray-600 leading-relaxed">
                                Payment confirmation takes approximately 5-10
                                minutes to process
                            </p>
                        </div>
                    </div>

                    <!-- Step 2: Neutral -->
                    <div
                        class="guide-step-card flex items-start gap-4 p-5 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                        <div
                            class="flex-shrink-0 w-10 h-10 bg-slate-600 text-white rounded-full flex items-center justify-center font-bold text-base shadow-sm"
                        >
                            2
                        </div>
                        <div class="flex-1">
                            <h4
                                class="text-sm font-bold text-gray-800 mb-2 leading-tight"
                            >
                                Changing Payment Method
                            </h4>
                            <p class="text-sm text-gray-600 leading-relaxed">
                                To change payment method, wait until the current
                                transaction expires before creating a new one
                            </p>
                        </div>
                    </div>

                    <!-- Step 3: Info -->
                    <div
                        class="guide-step-card flex items-start gap-4 p-5 bg-blue-50 border border-blue-100 rounded-lg"
                    >
                        <div
                            class="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-base shadow-sm"
                        >
                            3
                        </div>
                        <div class="flex-1">
                            <h4
                                class="text-sm font-bold text-gray-800 mb-2 leading-tight"
                            >
                                Course Fee Calculation
                            </h4>
                            <p class="text-sm text-gray-600 leading-relaxed">
                                Course fees are calculated based on your student
                                level and program
                            </p>
                        </div>
                    </div>

                    <!-- Step 4: Neutral -->
                    <div
                        class="guide-step-card flex items-start gap-4 p-5 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                        <div
                            class="flex-shrink-0 w-10 h-10 bg-slate-600 text-white rounded-full flex items-center justify-center font-bold text-base shadow-sm"
                        >
                            4
                        </div>
                        <div class="flex-1">
                            <h4
                                class="text-sm font-bold text-gray-800 mb-2 leading-tight"
                            >
                                Refresh Payment History
                            </h4>
                            <p class="text-sm text-gray-600 leading-relaxed">
                                If status doesn't update automatically, use the
                                refresh button in payment history
                            </p>
                        </div>
                    </div>

                    <!-- Step 5: Warning -->
                    <div
                        class="guide-step-card flex items-start gap-4 p-5 bg-red-50 border border-red-200 rounded-lg"
                    >
                        <div
                            class="flex-shrink-0 w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-base shadow-sm"
                        >
                            !
                        </div>
                        <div class="flex-1">
                            <h4
                                class="text-sm font-bold text-gray-800 mb-2 leading-tight"
                            >
                                Payment Status Issue
                            </h4>
                            <p class="text-sm text-gray-600 leading-relaxed">
                                If payment succeeded but shows pending/failed,
                                please contact admin immediately
                            </p>
                        </div>
                    </div>

                    <!-- Close Button -->
                    <BaseButton
                        variant="primary"
                        size="md"
                        block
                        @click="closeGuideModal"
                        class="mt-4"
                        aria-label="Close payment guide"
                    >
                        Got it, Thanks!
                    </BaseButton>
                </div>
            </template>
        </Modal>
    </div>
</template>

<style scoped>
.payment-section-glass {
    background: #ffffff;
}

.payment-type-card {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.payment-type-card:hover {
    box-shadow:
        0 10px 25px -5px rgba(0, 0, 0, 0.1),
        0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.guide-step-card {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.guide-step-card:hover {
    box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.08);
}

.slide-up-enter-active {
    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up-leave-active {
    transition: transform 0.2s ease-in;
}
.slide-up-enter-from,
.slide-up-leave-to {
    transform: translateY(100%);
}

@media (prefers-reduced-motion: reduce) {
    .payment-type-card,
    .guide-step-card {
        transition: none;
    }
    .slide-up-enter-active,
    .slide-up-leave-active {
        transition: none;
    }
    .slide-up-enter-from,
    .slide-up-leave-to {
        transform: none;
    }
}
</style>
