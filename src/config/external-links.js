export const externalLinks = [
  {
    name: 'Supabase',
    url: import.meta.env.VITE_SUPABASE_URL,
    icon: 'i-lucide-database',
    category: 'Backend',
    description: 'Database & Auth Dashboard',
    color: 'emerald'
  },
  {
    name: 'Coolify',
    url: import.meta.env.VITE_COOLIFY_URL,
    icon: 'i-lucide-server',
    category: 'Backend',
    description: 'Self-hosted PaaS',
    color: 'purple'
  },
  {
    name: 'Midtrans',
    url: import.meta.env.VITE_MIDTRANS_URL,
    icon: 'i-lucide-credit-card',
    category: 'Payment',
    description: 'Payment Gateway',
    color: 'blue'
  },
  {
    name: 'Gmail',
    url: import.meta.env.VITE_GMAIL_URL,
    icon: 'i-lucide-mail',
    category: 'Communication',
    description: 'Email Service',
    color: 'red'
  },
  {
    name: 'Omnichat',
    url: import.meta.env.VITE_OMNICHAT_URL,
    icon: 'i-lucide-message-circle',
    category: 'Communication',
    description: 'WhatsApp Business',
    color: 'green'
  },
  {
    name: 'Google Drive',
    url: import.meta.env.VITE_GOOGLE_DRIVE_URL,
    icon: 'i-lucide-folder',
    category: 'Storage',
    description: 'Cloud Storage',
    color: 'yellow'
  },
  {
    name: 'Notion',
    url: import.meta.env.VITE_NOTION_URL,
    icon: 'i-lucide-file-text',
    category: 'Documentation',
    description: 'Notes & Docs',
    color: 'gray'
  },
  {
    name: 'Analytics',
    url: import.meta.env.VITE_ANALYTICS_URL,
    icon: 'i-lucide-bar-chart-3',
    category: 'Analytics',
    description: 'Website Analytics',
    color: 'orange'
  }
]
