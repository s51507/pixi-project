import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../pages/(home).vue'),
    },
    {
      path: '/spine-showcase',
      name: 'spine-showcase',
      component: () => import('../pages/spine-showcase.vue'),
    },
  ],
})

export default router
