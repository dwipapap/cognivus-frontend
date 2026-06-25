<script setup>
import IconBook from "~icons/basil/book-solid";
import IconBadge from "~icons/basil/award-solid";
import IconWallet from "~icons/basil/wallet-outline";
import IconMoney from "~icons/solar/wallet-money-bold-duotone";
import IconInfo from "~icons/basil/info-circle-outline";

defineProps({
    programName: { type: String, default: "" },
    levelName: { type: String, default: "" },
    semesterFee: { type: Number, default: 0 },
    monthlyFee: { type: Number, default: 0 },
    loading: { type: Boolean, default: false },
    pricingAvailable: { type: Boolean, default: true },
    formatCurrency: { type: Function, required: true },
});
</script>

<template>
    <div
        class="payment-section-glass rounded-xl p-5 shadow-md border border-gray-200"
    >
        <h2 class="text-lg font-bold text-gray-800 mb-4">
            Program & Billing Info
        </h2>

        <div v-if="loading" class="grid grid-cols-2 gap-3">
            <div v-for="i in 4" :key="i" class="animate-pulse">
                <div class="h-24 bg-gray-100 rounded-lg"></div>
            </div>
        </div>

        <div v-else class="grid grid-cols-2 gap-3">
            <div
                class="bg-blue-50/50 rounded-lg p-3.5 border border-blue-100/50 hover:shadow-sm transition-shadow"
            >
                <div class="flex items-center gap-2 mb-2">
                    <div
                        class="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm"
                    >
                        <IconBook class="w-4.5 h-4.5 text-white" />
                    </div>
                </div>
                <p class="text-xs font-medium text-gray-500 mb-0.5">Program</p>
                <p class="text-sm font-bold text-gray-800 truncate">
                    {{ programName || "Loading..." }}
                </p>
            </div>

            <div
                class="bg-blue-50/50 rounded-lg p-3.5 border border-blue-100/50 hover:shadow-sm transition-shadow"
            >
                <div class="flex items-center gap-2 mb-2">
                    <div
                        class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm"
                    >
                        <IconBadge class="w-4.5 h-4.5 text-white" />
                    </div>
                </div>
                <p class="text-xs font-medium text-gray-500 mb-0.5">Level</p>
                <p class="text-sm font-bold text-gray-800 truncate">
                    {{ levelName || "Loading..." }}
                </p>
            </div>

            <div
                class="bg-blue-50/50 rounded-lg p-3.5 border border-blue-100/50 hover:shadow-sm transition-shadow"
            >
                <div class="flex items-center gap-2 mb-2">
                    <div
                        class="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm"
                    >
                        <IconWallet class="w-4.5 h-4.5 text-white" />
                    </div>
                </div>
                <p class="text-xs font-medium text-gray-500 mb-0.5">
                    Semester Fee
                </p>
                <p class="text-sm font-bold text-blue-600 truncate">
                    {{
                        pricingAvailable
                            ? formatCurrency(semesterFee)
                            : "Unavailable"
                    }}
                </p>
            </div>

            <div
                class="bg-blue-50/50 rounded-lg p-3.5 border border-blue-100/50 hover:shadow-sm transition-shadow"
            >
                <div class="flex items-center gap-2 mb-2">
                    <div
                        class="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm"
                    >
                        <IconMoney class="w-4.5 h-4.5 text-white" />
                    </div>
                </div>
                <p class="text-xs font-medium text-gray-500 mb-0.5">
                    Monthly Fee
                </p>
                <p class="text-sm font-bold text-blue-600 truncate">
                    {{
                        pricingAvailable
                            ? formatCurrency(monthlyFee)
                            : "Unavailable"
                    }}
                </p>
            </div>
        </div>

        <div
            class="mt-4 flex items-start gap-2 bg-blue-50 rounded-full p-3 border border-blue-100"
        >
            <IconInfo class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p
                class="text-xs"
                :class="pricingAvailable ? 'text-blue-700' : 'text-amber-700'"
            >
                {{
                    pricingAvailable
                        ? "Fees are calculated based on your program level"
                        : "No billing price is configured for your current level"
                }}
            </p>
        </div>
    </div>
</template>
