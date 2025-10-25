import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import i18n from './i18n'

// Add some debugging
console.log('Creating app...');

try {
  import('./assets/styles/tailwind.css')
  
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