<script setup>
definePageMeta({ layout: 'student', middleware: ['auth'] })
navigateTo('/student/dashboard', { redirectCode: 301 })
</script>
