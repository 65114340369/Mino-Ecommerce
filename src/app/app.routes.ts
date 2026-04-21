import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products').then((m) => m.ProductsComponent),
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./pages/product-detail/product-detail').then((m) => m.ProductDetailComponent),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.CheckoutComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/auth').then((m) => m.AuthComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  // ── Admin ──────────────────────────────────────────────────────────────────
  {
    path: 'admin/login',
    loadComponent: () => import('./pages/admin/admin-login/admin-login').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-layout/admin-layout').then((m) => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/admin-overview/admin-overview').then((m) => m.AdminOverviewComponent),
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/admin/admin-products/admin-products').then((m) => m.AdminProductsComponent),
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/admin/admin-orders/admin-orders').then((m) => m.AdminOrdersComponent),
      },
      {
        path: 'members',
        loadComponent: () => import('./pages/admin/admin-members/admin-members').then((m) => m.AdminMembersComponent),
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
