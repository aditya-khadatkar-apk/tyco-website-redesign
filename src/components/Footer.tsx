import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer
      className="py-12 border-t transition-colors duration-300"
      style={{
        backgroundColor: 'var(--st-footer-bg, #0f172a)',
        borderColor:     'var(--st-footer-border, rgba(255,255,255,0.06))',
        color:           'var(--st-footer-text, #94a3b8)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand */}
          <div>
            <span
              className="text-2xl font-heading font-bold tracking-tight block mb-4"
              style={{ color: 'var(--st-footer-heading, #ffffff)' }}
            >
              TYCO{' '}
              <span style={{ color: 'var(--st-primary, #ea580c)' }}>INDIA</span>
            </span>
            <p className="text-sm leading-relaxed max-w-xs">
              Providing high-performance industrial equipment since 1977. We specialize in
              Pulverisers, Crushers, Classifiers, and Material Handling Systems.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3
              className="font-semibold mb-4"
              style={{ color: 'var(--st-footer-heading, #ffffff)' }}
            >
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: 'Company Profile', path: '/company-profile' },
                { label: 'Our Products',    path: '/products' },
                { label: 'Contact Us',      path: '/contact-us' },
                { label: 'Admin Portal',    path: '/admin', external: true },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.path}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="transition-colors"
                    style={{ color: 'var(--st-footer-text, #94a3b8)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--st-primary, #ea580c)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--st-footer-text, #94a3b8)';
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3
              className="font-semibold mb-4"
              style={{ color: 'var(--st-footer-heading, #ffffff)' }}
            >
              Contact Info
            </h3>
            <ul className="space-y-2 text-sm">
              <li>Nagpur Factory, Maharashtra, India</li>
              <li>Email: info@tyco-india.com</li>
              <li>ISO 9001 Certified</li>
            </ul>
          </div>
        </div>

        <div
          className="mt-12 pt-8 text-sm text-center"
          style={{ borderTop: '1px solid var(--st-footer-border, rgba(255,255,255,0.06))' }}
        >
          <p>© {new Date().getFullYear()} Tyco India Private Limited. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
