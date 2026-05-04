import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { authStore } from './store/auth';
import ui from '@nuxt/ui/vue-plugin'

authStore.init().then(() => {
  const app = createApp(App);
  app.use(router);
  app.use(ui);
  
  app.mount('#app');
});