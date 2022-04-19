import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import 'ant-design-vue/dist/antd.css';
import Antd from 'ant-design-vue';
import components from './components';
import App from './App.vue';
import Landing from './pages/Landing/index.vue';
import Session from './pages/Session/index.vue';

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes: [
    { path: '/', component: Landing },
    { path: '/session/:userId', component: Session },
  ],
});

createApp(App).use(Antd).use(components).use(router).mount('#app');
