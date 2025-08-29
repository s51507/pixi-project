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
    {
      path: '/refactored-demo',
      name: 'refactored-demo',
      component: () => import('../pages/refactored-demo.vue'),
    },
    {
      path: '/assets-gallery',
      name: 'assets-gallery',
      component: () => import('../pages/assets-gallery.vue'),
    },
    {
      path: '/integrated-scene',
      name: 'integrated-scene',
      component: () => import('../pages/integrated-scene.vue'),
    },
    {
      path: '/jump-test',
      name: 'jump-test',
      component: () => import('../pages/jump-test.vue'),
    },
    {
      path: '/funky-rocket-demo',
      name: 'funky-rocket-demo',
      component: () => import('../pages/funky-rocket-demo.vue'),
    },
    {
      path: '/funky-rocket-showcase',
      name: 'funky-rocket-showcase',
      component: () => import('../pages/funky-rocket-showcase.vue'),
    },
  ],
})

export default router
