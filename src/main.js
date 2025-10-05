import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { authStore } from './store/auth';
import 'flowbite';

authStore.init().then(() => {
  const app = createApp(App);
  app.use(router);
  
  // Make router available globally for auth redirects
  window.$router = router;
  
  app.mount('#app');
});