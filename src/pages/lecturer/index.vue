<script setup>
definePageMeta({ layout: 'lecturer', middleware: ['auth'] })
navigateTo('/lecturer/dashboard', { redirectCode: 301 })
</script>
