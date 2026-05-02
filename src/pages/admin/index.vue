<script setup>
definePageMeta({ layout: 'admin', middleware: ['auth'] })
navigateTo('/admin/dashboard', { redirectCode: 301 })
</script>
