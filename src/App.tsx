import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/public/Home';
import CompanyProfile from './pages/public/CompanyProfile';
import Products from './pages/public/Products';
import ContactUs from './pages/public/ContactUs';

import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes with Layout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/company-profile" element={<CompanyProfile />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact-us" element={<ContactUs />} />
        </Route>
        
        {/* Admin Login Route (No Layout) */}
        <Route path="/admin/login" element={<Login />} />

        {/* Secure Admin Routes */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            {/* We will add more admin routes here later: pages, products, settings */}
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
