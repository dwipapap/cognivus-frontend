<script setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from "vue";
import { authStore } from "../../store/auth";
import { useStudentProfile } from "../../composables/useStudentProfile";
import { useClassDetails } from "../../composables/useClassDetails";
import { useSnapPayment } from "../../composables/useSnapPayment";
import { paymentAPI, priceAPI, ancillaryPriceAPI } from "../../services/api";
import { formatCurrency, formatDate } from "../../utils/formatters";
import {
    findPriceForLevel,
    getResumablePayment,
} from "../../utils/payment";
import IconQuestionCircle from "~icons/solar/question-circle-broken";
import Modal from "../../components/ui/Modal.vue";
import BaseButton from "../../components/ui/BaseButton.vue";
import ContinuePaymentOverlay from "../../components/student/ContinuePaymentOverlay.vue";
import ProgramBillingCard from "../../components/student/ProgramBillingCard.vue";
import PaymentHistoryTable from "../../components/student/PaymentHistoryTable.vue";
import PaymentOptionsPanel from "../../components/student/PaymentOptionsPanel.vue";
import PaymentSummaryPanel from "../../components/student/PaymentSummaryPanel.vue";
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

// Responsive state
const isMobile = ref(false);

function checkScreen() {
    isMobile.value = window.innerWidth < 1024;
}

// State
const selectedPaymentType = ref(null);
const prices = ref([]);
const isPricesLoading = ref(true);
const showSuccessModal = ref(false);
const showErrorModal = ref(false);
const showGuideModal = ref(false);
const showMobilePaymentSummary = ref(false);
const showContinueModal = ref(false);
const continuePayment = ref(null);
const continueLoading = ref(false);
const continueError = ref('');
const continueErrorTitle = ref('Payment Cannot Continue');
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

const currentLevelPrice = computed(() =>
    findPriceForLevel(prices.value, classInfo.value?.levelid),
);

const hasRegularPricing = computed(() => Boolean(currentLevelPrice.value));

const currentSemesterFee = computed(
    () => Number(currentLevelPrice.value?.harga) || 0,
);

const currentMonthlyFee = computed(
    () => Number(currentLevelPrice.value?.monthlyprice) || 0,
);

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
    const isRegularPayment = regularPaymentTypes.some(
        (type) => type.id === typeId,
    );
    if (isRegularPayment && !hasRegularPricing.value) return;

    selectedPaymentType.value = typeId;
    resetPaymentState();
};

const handlePayment = async () => {
    if (!canPay.value) return;

    try {
        resetPaymentState();

        const studentid = studentProfile.value?.studentid || authStore.user?.userid;
        const paymentData = {
            email: studentEmail.value,
            amount: selectedAmount.value,
            name: studentName.value,
            studentid,
            payment_type: selectedPaymentType.value,
        };

        // Sync stale pending payments before generating new token
        if (studentid) {
            try { await paymentAPI.refreshPaymentStatus(studentid); } catch (_) {}
        }

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
    continueError.value = '';
    continueErrorTitle.value = 'Payment Cannot Continue';
};

const handleContinuePayment = async () => {
    const selectedPendingPayment = continuePayment.value;
    if (!selectedPendingPayment) return;

    try {
        continueLoading.value = true;
        continueError.value = '';

        const studentid =
            selectedPendingPayment.studentid ||
            studentProfile.value?.studentid ||
            authStore.user?.userid;

        if (!studentid) {
            throw new Error("Student account is unavailable");
        }

        // The backend remains authoritative for Midtrans transaction status.
        await paymentAPI.refreshPaymentStatus(studentid);
        const refreshedPayments = await fetchPaymentHistory();

        if (!refreshedPayments) {
            throw new Error("Unable to load the latest payment history");
        }

        const { payment: refreshedPayment, reason } = getResumablePayment(
            refreshedPayments,
            selectedPendingPayment,
        );

        if (reason === 'not_pending') {
            showContinueModal.value = false;
            continuePayment.value = null;

            if (String(refreshedPayment.status).toLowerCase() === 'success') {
                showSuccessModal.value = true;
            } else {
                continueErrorTitle.value = 'Payment Status Changed';
                continueError.value =
                    `This payment is no longer pending. Current status: ${refreshedPayment.status || 'unknown'}.`;
                showErrorModal.value = true;
            }
            return;
        }

        if (reason === 'not_found') {
            throw new Error("The payment could not be found after refreshing");
        }

        if (reason === 'missing_token') {
            throw new Error("The refreshed payment has no reusable token");
        }

        continuePayment.value = refreshedPayment;

        await pay(refreshedPayment.token, {
            onSuccess: (result) => {
                showContinueModal.value = false;
                continuePayment.value = null;
                showSuccessModal.value = true;
                fetchPaymentHistory();
                selectedPaymentType.value = null;
            },
            onPending: (result) => {
                showContinueModal.value = false;
                continuePayment.value = null;
                fetchPaymentHistory();
            },
            onError: (result) => {
                showContinueModal.value = false;
                continuePayment.value = null;
                continueErrorTitle.value = 'Payment Session Expired';
                continueError.value = 'Payment session may have expired. Please try creating a new payment.';
                showErrorModal.value = true;
            },
            onClose: () => {
                // Sync status after closing the popup
                if (studentid) {
                    paymentAPI
                        .refreshPaymentStatus(studentid)
                        .then(() => fetchPaymentHistory())
                        .catch(() => fetchPaymentHistory());
                } else {
                    fetchPaymentHistory();
                }
            },
        });
    } catch (err) {
        console.error("Continue payment error:", err);
        continueErrorTitle.value = 'Payment Cannot Continue';
        continueError.value =
            'We could not verify the latest payment status. Refresh your payment history and try again.';
        showErrorModal.value = true;
        showContinueModal.value = false;
        continuePayment.value = null;
    } finally {
        continueLoading.value = false;
    }
};

const openContinueModal = (payment) => {
    continuePayment.value = payment;
    showContinueModal.value = true;
};

const closeContinueModal = () => {
    showContinueModal.value = false;
    continuePayment.value = null;
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
            paymentHistory.value = [];
            return null;
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
        return paymentHistory.value;
    } catch (err) {
        console.error("Failed to fetch payment history:", err);
        paymentHistory.value = [];
        return null;
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
    window.removeEventListener("resize", checkScreen);
});

// Lifecycle
onMounted(async () => {
    checkScreen();
    window.addEventListener("resize", checkScreen);
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
                :pricing-available="hasRegularPricing"
                :format-currency="formatCurrency"
            />
        </div>

        <!-- Main Grid Layout: 2 columns on desktop -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- LEFT COLUMN: Payment Types & History (spans 2 cols on desktop) -->
            <div class="lg:col-span-2 space-y-6">
                <PaymentOptionsPanel
                    :regular-payment-types="regularPaymentTypes"
                    :ancillary-payment-types="ancillaryPaymentTypes"
                    :selected-payment-type="selectedPaymentType"
                    :semester-fee="currentSemesterFee"
                    :monthly-fee="currentMonthlyFee"
                    :regular-pricing-available="hasRegularPricing"
                    :regular-loading="isClassLoading || isPricesLoading"
                    :ancillary-loading="isAncillaryLoading"
                    :format-currency="formatCurrency"
                    @select="selectPaymentType"
                />

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
                        @continue-payment="openContinueModal"
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
                        :pricing-available="hasRegularPricing"
                        :format-currency="formatCurrency"
                    />
                </div>

                <PaymentSummaryPanel
                    v-model:open="showMobilePaymentSummary"
                    :student-name="studentName"
                    :student-email="studentEmail"
                    :payment-type-name="
                        selectedPaymentType
                            ? getPaymentTypeName(selectedPaymentType)
                            : '-'
                    "
                    :selected="Boolean(selectedPaymentType)"
                    :amount="selectedAmount"
                    :can-pay="canPay"
                    :loading="isPaymentLoading"
                    :format-currency="formatCurrency"
                    @pay="handlePayment"
                    @cancel="selectPaymentType(null)"
                />
            </div>
        </div>

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
                @continue-payment="openContinueModal"
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
            :title="continueError ? continueErrorTitle : 'Payment Failed'"
            :message="
                continueError ||
                paymentError ||
                'An error occurred while processing the payment.'
            "
            @close="closeErrorModal"
            @confirm="closeErrorModal"
        />

        <!-- Continue Payment — Desktop Modal -->
        <ContinuePaymentOverlay
            v-model:open="showContinueModal"
            :is-mobile="isMobile"
            :payment="continuePayment"
            :loading="continueLoading"
            :get-payment-type-name="getPaymentTypeName"
            :format-currency="formatCurrency"
            :format-date="formatDate"
            @pay="handleContinuePayment"
            @cancel="closeContinueModal"
        />

        <!-- Continue Payment — Mobile Bottom Sheet -->

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
.guide-step-card {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.guide-step-card:hover {
    box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.08);
}

@media (prefers-reduced-motion: reduce) {
    .guide-step-card {
        transition: none;
    }
}
</style>
