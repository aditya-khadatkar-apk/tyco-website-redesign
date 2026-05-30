import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/public/Home';
import CompanyProfile from './pages/public/CompanyProfile';
import Products from './pages/public/Products';
import Clients from './pages/public/Clients';
import ContactUs from './pages/public/ContactUs';
import { ThemeProvider } from './contexts/ThemeContext';
import { SiteThemeProvider } from './contexts/SiteThemeContext';
import ProductDetails from './pages/public/ProductDetails';

import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import PagesCMS from './pages/admin/PagesCMS';
import Users from './pages/admin/Users';
import ProductsManager from './pages/admin/ProductsManager';
import ProductEditor from './pages/admin/ProductEditor';
import ChangePassword from './pages/admin/ChangePassword';
import ForgotPassword from './pages/admin/ForgotPassword';
import Settings from './pages/admin/Settings';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Layout */}
        <Route element={<SiteThemeProvider><ThemeProvider storageKey="public-theme"><PublicLayout /></ThemeProvider></SiteThemeProvider>}>
          <Route path="/" element={<Home />} />
          <Route path="/company-profile" element={<CompanyProfile />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/contact-us" element={<ContactUs />} />
        </Route>

        {/* Admin Login Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />

        {/* Secure Admin Routes */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin/change-password" element={<ChangePassword />} />
          {/* Admin Routes */}
          <Route path="/admin" element={<ThemeProvider storageKey="admin-theme"><AdminLayout /></ThemeProvider>}>
            <Route index element={<Dashboard />} />
            <Route path="pages" element={<PagesCMS />} />
            <Route path="users" element={<Users />} />
            <Route path="products" element={<ProductsManager />} />
            <Route path="products/new" element={<ProductEditor />} />
            <Route path="products/edit/:id" element={<ProductEditor />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
