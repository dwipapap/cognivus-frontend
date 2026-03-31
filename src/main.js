import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { authStore } from './store/auth';
import 'flowbite';

authStore.init().then(() => {
  const app = createApp(App);
  app.use(router);
  
  app.mount('#app');
});