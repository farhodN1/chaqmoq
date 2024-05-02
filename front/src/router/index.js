import { createRouter, createWebHistory } from 'vue-router';
import LogIn from '../components/LogIn.vue';
import UserList from '../components/UserList';
import RightSide from '../components/RightSide';

const routes = [
  {
    path: '/',
    components: {
        default: UserList,
        additionalComponent: RightSide
    },
    meta: {requiresAuth: true}
  },
  {
    path: '/login',
    name: 'LogIn',
    component: LogIn
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach((to, from, next) => {
    // Check if the route requires authentication
    if (to.matched.some(record => record.meta.requiresAuth)) {
      // Check if user is authenticated, replace with your own logic
      const isAuthenticated = checkAuth();
  
      if (!isAuthenticated) {
        // If user is not authenticated, redirect to login page
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        // If user is authenticated, continue to the requested route
        next();
      }
    } else {
      // If the route doesn't require authentication, continue as usual
      next();
    }
  });
  function getCookie(name) {
    const cookie = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return cookie ? cookie[2] : null;
  }
  const user_id = getCookie('user_id');
  function checkAuth() {
    // Example function to check if user is authenticated
    return  user_id !== null;
  }

export default router;
