import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Rules from '../views/Rules.vue';
import Game from '../views/Game.vue';
import Contact from '../views/Contact.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/rules',
      name: 'rules',
      component: Rules
    },
    {
      path: '/game',
      name: 'game',
      component: Game
    },
    {
      path: '/contact',
      name: 'contact',
      component: Contact
    }
  ]
});

export default router;
