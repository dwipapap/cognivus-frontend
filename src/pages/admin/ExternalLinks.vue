<script setup>
/**
 * External Links page - Grid of icon cards linking to external services
 */

const externalLinks = [
    // Backend & Database
    {
        name: 'Supabase',
        url: 'https://supabaseittr.cognivus.cloud/project/default',
        icon: 'database',
        category: 'Backend',
        description: 'Database & Auth Dashboard',
        color: 'emerald'
    },
    {
        name: 'Coolify',
        url: 'http://145.79.8.41:8000/',
        icon: 'cloud',
        category: 'Backend',
        description: 'Self-hosted PaaS',
        color: 'purple'
    },
    // Payment
    {
        name: 'Midtrans',
        url: 'https://dashboard.midtrans.com',
        icon: 'credit-card',
        category: 'Payment',
        description: 'Payment Gateway',
        color: 'blue'
    },
    // Communication
    {
        name: 'Gmail',
        url: 'https://mail.google.com',
        icon: 'mail',
        category: 'Communication',
        description: 'Email Service',
        color: 'red'
    },
    {
        name: 'Omnichat',
        url: 'https://app.omnichat.id/app',
        icon: 'chat',
        category: 'Communication',
        description: 'WhatsApp Business',
        color: 'green'
    },
    // Storage & Docs
    {
        name: 'Google Drive',
        url: 'https://drive.google.com',
        icon: 'folder',
        category: 'Storage',
        description: 'Cloud Storage',
        color: 'yellow'
    },
    {
        name: 'Notion',
        url: 'https://notion.so',
        icon: 'document',
        category: 'Documentation',
        description: 'Notes & Docs',
        color: 'gray'
    },
    // Analytics
    {
        name: 'Analytics',
        url: 'https://analytics.google.com',
        icon: 'chart',
        category: 'Analytics',
        description: 'Website Analytics',
        color: 'orange'
    }
];

/** Get background color class */
const getBgColor = (color) => {
    const colors = {
        emerald: 'bg-emerald-100 hover:bg-emerald-200',
        blue: 'bg-blue-100 hover:bg-blue-200',
        red: 'bg-red-100 hover:bg-red-200',
        green: 'bg-green-100 hover:bg-green-200',
        yellow: 'bg-yellow-100 hover:bg-yellow-200',
        orange: 'bg-orange-100 hover:bg-orange-200',
        purple: 'bg-purple-100 hover:bg-purple-200',
        gray: 'bg-gray-100 hover:bg-gray-200'
    };
    return colors[color] || 'bg-gray-100 hover:bg-gray-200';
};

/** Get icon color class */
const getIconColor = (color) => {
    const colors = {
        emerald: 'text-emerald-600',
        blue: 'text-blue-600',
        red: 'text-red-600',
        green: 'text-green-600',
        yellow: 'text-yellow-600',
        orange: 'text-orange-600',
        purple: 'text-purple-600',
        gray: 'text-gray-600'
    };
    return colors[color] || 'text-gray-600';
};
</script>

<template>
    <div>
        <!-- Header -->
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900">External Links</h1>
            <p class="text-gray-500 mt-1">Quick access to external services and tools</p>
        </div>

        <!-- Links Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <a v-for="link in externalLinks" :key="link.name" :href="link.url" target="_blank" rel="noopener noreferrer"
                :class="[getBgColor(link.color), 'group rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border border-transparent hover:border-gray-200']">
                <!-- Icon -->
                <div :class="['w-12 h-12 rounded-xl flex items-center justify-center mb-4', getIconColor(link.color)]">
                    <!-- Database -->
                    <svg v-if="link.icon === 'database'" class="w-8 h-8" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    <!-- Cloud -->
                    <svg v-else-if="link.icon === 'cloud'" class="w-8 h-8" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                    <!-- Credit Card -->
                    <svg v-else-if="link.icon === 'credit-card'" class="w-8 h-8" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <!-- Mail -->
                    <svg v-else-if="link.icon === 'mail'" class="w-8 h-8" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <!-- Chat -->
                    <svg v-else-if="link.icon === 'chat'" class="w-8 h-8" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <!-- Folder -->
                    <svg v-else-if="link.icon === 'folder'" class="w-8 h-8" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <!-- Document -->
                    <svg v-else-if="link.icon === 'document'" class="w-8 h-8" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <!-- Chart -->
                    <svg v-else-if="link.icon === 'chart'" class="w-8 h-8" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <!-- Default -->
                    <svg v-else class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </div>

                <!-- Text -->
                <h3 class="font-semibold text-gray-800 group-hover:text-gray-900">{{ link.name }}</h3>
                <p class="text-xs text-gray-500 mt-1">{{ link.description }}</p>

                <!-- External icon indicator -->
                <div class="mt-3 flex items-center text-xs text-gray-400">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open
                </div>
            </a>
        </div>

        <!-- Category Legend -->
        <div class="mt-8 p-4 bg-gray-50 rounded-xl">
            <p class="text-sm text-gray-500">
                <span class="font-medium text-gray-700">Tip:</span>
                All links open in a new tab. Edit the links in <code
                    class="bg-gray-200 px-1.5 py-0.5 rounded text-xs">ExternalLinks.vue</code> to customize.
            </p>
        </div>
    </div>
</template>

<style scoped>
.grid>a {
    animation: fadeIn 0.3s ease-out;
    animation-fill-mode: backwards;
}

.grid>a:nth-child(1) {
    animation-delay: 0.05s;
}

.grid>a:nth-child(2) {
    animation-delay: 0.1s;
}

.grid>a:nth-child(3) {
    animation-delay: 0.15s;
}

.grid>a:nth-child(4) {
    animation-delay: 0.2s;
}

.grid>a:nth-child(5) {
    animation-delay: 0.25s;
}

.grid>a:nth-child(6) {
    animation-delay: 0.3s;
}

.grid>a:nth-child(7) {
    animation-delay: 0.35s;
}

.grid>a:nth-child(8) {
    animation-delay: 0.4s;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
