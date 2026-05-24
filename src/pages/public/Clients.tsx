import { Helmet } from 'react-helmet-async';
import { Users, Award } from 'lucide-react';
import { useCMS } from '../../hooks/useCMS';
import { useMachineData } from '../../hooks/useMachineData';
import { useState, useEffect, useRef } from 'react';
import IndiaMap from '../../components/IndiaMap';

// Animated counter component
function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const numericTarget = parseInt(target.replace(/[^0-9]/g, ''), 10) || 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const duration = 1500;
          const steps = 40;
          const increment = numericTarget / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= numericTarget) {
              setCount(numericTarget);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [numericTarget]);

  // Extract the suffix from original (e.g., "700+" → "+")
  const originalSuffix = target.replace(/[0-9]/g, '').trim() || suffix;

  return (
    <div ref={ref} className="text-4xl md:text-5xl font-extrabold text-white font-heading">
      {count.toLocaleString()}{originalSuffix}
    </div>
  );
}

export default function Clients() {
  const { content, loading: cmsLoading } = useCMS('clients');
  const { aggregates, getStateMachineBreakdown, getTopClients, loading: machinesLoading } = useMachineData();
  if (cmsLoading || machinesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-industrial-100 min-h-screen">
      <Helmet>
        <title>Our Clients | Tyco India Private Limited</title>
        <meta name="description" content="Trusted by 1500+ industry leaders across India. Explore our client portfolio spanning steel, sugar, chemicals, food, and engineering sectors." />
      </Helmet>

      {/* Section 1: Hero Banner */}
      <section className="relative bg-industrial-900 py-16 md:py-24 overflow-hidden">
        {content.hero_image && (
          <div className="absolute inset-0 z-0">
            <img src={content.hero_image} alt="Header Background" className="w-full h-full object-cover mix-blend-overlay opacity-40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-industrial-900/95 via-industrial-900/85 to-primary-900/70 z-0"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-600/20 border border-primary-500/30 text-white text-sm font-medium mb-6">
            <Users className="h-4 w-4 mr-2" />
            Our Valued Partners
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 max-w-4xl mx-auto">
            {content.hero_title}
          </h1>
          <p className="text-industrial-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {content.hero_subtitle}
          </p>
        </div>
      </section>

      {/* Section 2: Animated Stats Counter Bar */}
      {content.stats && content.stats.length > 0 && (
        <section className="bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 py-10 -mt-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid grid-cols-2 md:grid-cols-${Math.min(content.stats.length, 4)} gap-8 text-center`}>
              {content.stats.map((stat: any, index: number) => (
                <div key={index} className="flex flex-col items-center">
                  <AnimatedCounter target={stat.number} />
                  <p className="text-primary-100/80 text-sm md:text-base mt-2 font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 3: Featured Clients (Logo Grid) */}
      {content.featured_clients && content.featured_clients.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-industrial-900 mb-3">
                Blue Chip Clients
              </h2>
              <p className="text-industrial-500 max-w-2xl mx-auto">
                Leading companies across India trust Tyco for their industrial equipment needs.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {content.featured_clients.map((client: any, index: number) => (
                <div
                  key={index}
                  className="group bg-white border border-industrial-100 rounded-xl p-5 flex flex-col items-center justify-center hover:shadow-lg hover:border-primary-200 transition-all duration-300"
                >
                  {client.image_url ? (
                    <div className="w-full aspect-[3/2] flex items-center justify-center mb-3 overflow-hidden">
                      {client.website_url ? (
                        <a href={client.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-full">
                          <img src={client.image_url} alt={client.name || `Client ${index + 1}`} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                        </a>
                      ) : (
                        <img src={client.image_url} alt={client.name || `Client ${index + 1}`} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                      )}
                    </div>
                  ) : (
                    <div className="w-full aspect-[3/2] flex items-center justify-center mb-3 bg-industrial-50 rounded-lg">
                      <Award className="h-8 w-8 text-industrial-300" />
                    </div>
                  )}
                  {client.name && (
                    <span className="text-xs font-semibold text-industrial-700 text-center line-clamp-2">{client.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section 4: India Map + Section 5: Client Directory (Side by Side on desktop) */}
      <section className="py-16 md:py-20 bg-industrial-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-industrial-900 mb-3">
              Client Presence Across India
            </h2>
            <p className="text-industrial-500 max-w-2xl mx-auto">
              Our machines and equipment serve industries spanning the length and breadth of the country.
            </p>
          </div>

          <div className="flex justify-center">
            {/* India Map */}
            <div className="w-full max-w-4xl">
              <div className="bg-white rounded-2xl shadow-sm border border-industrial-200 p-6 md:p-10">
                <IndiaMap
                  title="Our Presence in India"
                  aggregates={aggregates}
                  getBreakdown={getStateMachineBreakdown}
                  getTopClients={getTopClients}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-industrial-900 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">
            Want to Join Our Growing Client List?
          </h2>
          <p className="text-industrial-400 mb-8">
            Get in touch with our team to discuss your industrial equipment requirements.
          </p>
          <a
            href="/contact-us"
            className="inline-flex items-center px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-md font-semibold transition-colors"
          >
            Contact Us Today
          </a>
        </div>
      </section>
    </div>
  );
}
