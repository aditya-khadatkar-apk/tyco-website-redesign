import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-industrial-900 text-industrial-300 py-12 border-t border-industrial-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="text-2xl font-heading font-bold text-white tracking-tight block mb-4">
              TYCO <span className="text-primary-500">INDIA</span>
            </span>
            <p className="text-sm leading-relaxed max-w-xs">
              Providing high-performance industrial equipment since 1977. We specialize in Pulverisers, Crushers, Classifiers, and Material Handling Systems.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/company-profile" className="hover:text-primary-400 transition-colors">Company Profile</Link></li>
              <li><Link to="/products" className="hover:text-primary-400 transition-colors">Our Products</Link></li>
              <li><Link to="/contact-us" className="hover:text-primary-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/admin" className="hover:text-primary-400 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-sm">
              <li>Nagpur Factory, Maharashtra, India</li>
              <li>Email: info@tyco-india.com</li>
              <li>ISO 9001 Certified</li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-industrial-800 text-sm text-center">
          <p>© {new Date().getFullYear()} Tyco India Private Limited. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
