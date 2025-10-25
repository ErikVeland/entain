import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import i18n from './i18n'

// Import theme initialization CSS first to prevent FOUC
import './assets/styles/theme-init.css'
import './assets/styles/tailwind.css'

// Add some debugging
console.log('Creating app...');

try {
  const app = createApp(App)
  const pinia = createPinia()
  
  app.use(pinia)
  app.use(i18n)
  
  console.log('Mounting app...');
  app.mount('#app')
  console.log('App mounted successfully!');
} catch (error) {
  console.error('Error creating app:', error);
}