import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';

// Dummy route components
const Home = { template: '<div>Home</div>' };
const Login = { template: '<div>Login</div>' };
const Admin = { template: '<div>Admin</div>' };
const NotFound = { template: '<div>404</div>' };

// Dummy routes config mirip index.js
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/admin', name: 'Admin', component: Admin, meta: { requiresAuth: true, role: 'admin' } },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
];

let router;

beforeEach(() => {
  router = createRouter({
    history: createWebHistory(),
    routes,
  });
});

describe('Vue Router Core Functionality', () => {
  it('1. should resolve Home route', async () => {
    const route = router.resolve('/');
    expect(route.name).toBe('Home');
  });

  it('2. should resolve Login route', async () => {
    const route = router.resolve('/login');
    expect(route.name).toBe('Login');
  });

  it('3. should resolve Admin route', async () => {
    const route = router.resolve('/admin');
    expect(route.name).toBe('Admin');
  });

  it('4. should resolve NotFound route for unknown path', async () => {
    const route = router.resolve('/unknown');
    expect(route.name).toBe('NotFound');
  });

  it('5. should have meta.requiresAuth for Admin route', () => {
    const route = routes.find(r => r.name === 'Admin');
    expect(route.meta.requiresAuth).toBe(true);
  });

  it('6. should have meta.role for Admin route', () => {
    const route = routes.find(r => r.name === 'Admin');
    expect(route.meta.role).toBe('admin');
  });

  it('7. should not have meta.requiresAuth for Home route', () => {
    const route = routes.find(r => r.name === 'Home');
    expect(route.meta).toBeUndefined();
  });

  it('8. should return correct component for Home route', () => {
    const route = routes.find(r => r.name === 'Home');
    expect(route.component).toBe(Home);
  });

  it('9. should return correct component for NotFound route', () => {
    const route = routes.find(r => r.name === 'NotFound');
    expect(route.component).toBe(NotFound);
  });

  it('10. should match dynamic NotFound for any unknown path', () => {
    const route = router.resolve('/does-not-exist');
    expect(route.name).toBe('NotFound');
  });
});
