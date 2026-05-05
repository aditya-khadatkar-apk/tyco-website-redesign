import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Settings, Factory, ShieldCheck, Award, Users, Cpu, Zap, Globe } from 'lucide-react';
import { useCMS } from '../../hooks/useCMS';

export default function Home() {
  const { content } = useCMS('home');

  return (
    <div>
      <Helmet>
        <title>Tyco India - Industrial Solutions</title>
        <meta name="description" content="Modern, high-performance industrial equipment, pulverisers, classifiers, and crushers by Tyco India since 1977." />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative bg-industrial-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-industrial-900 to-industrial-800 opacity-90"></div>
        {content.hero_image && (
          <div className="absolute inset-0 z-0">
            <img src={content.hero_image} alt="Hero Background" className="w-full h-full object-cover mix-blend-overlay opacity-40" />
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-start">
          <h1 className="text-4xl md:text-6xl font-heading font-extrabold tracking-tight mb-6 text-white max-w-3xl">
            {content.hero_title}
          </h1>
          <p className="text-lg md:text-xl text-industrial-300 max-w-2xl mb-10 leading-relaxed">
            {content.hero_subtitle}
          </p>
          <div className="flex space-x-4">
            <Link to="/products" className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-md font-semibold transition-colors flex items-center">
              Explore Products <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/contact-us" className="bg-industrial-700 hover:bg-industrial-600 text-white px-8 py-3 rounded-md font-semibold transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Client Logos Carousel Section */}
      {content.client_logos && content.client_logos.length > 0 && (
        <section className="py-16 bg-white border-b border-industrial-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-center text-industrial-900 mb-12">
              Trusted by Industry Leaders
            </h2>
            
            <div className="relative">
              <div className="flex overflow-x-auto gap-6 md:gap-8 pb-4 snap-x snap-mandatory hide-scrollbar">
                {content.client_logos.map((logo: any, idx: number) => {
                  const logoObj = typeof logo === 'string' ? { image_url: logo, name: '', website_url: '' } : logo;
                  
                  return (
                    <div 
                      key={idx} 
                      className="flex-none w-[calc(50%-12px)] md:w-[calc(25%-24px)] snap-center group flex flex-col items-center"
                    >
                      <div className="w-full bg-white rounded-xl p-6 flex items-center justify-center aspect-[3/2] shadow-sm hover:shadow-md transition-shadow border border-industrial-100 overflow-hidden mb-3">
                        {logoObj.website_url ? (
                          <a href={logoObj.website_url} target="_blank" rel="noopener noreferrer" className="flex w-full h-full items-center justify-center">
                            <img 
                              src={logoObj.image_url} 
                              alt={logoObj.name || `Client ${idx + 1}`} 
                              className="max-w-full max-h-full object-contain transform transition-transform duration-300 group-hover:scale-110" 
                            />
                          </a>
                        ) : (
                          <img 
                            src={logoObj.image_url} 
                            alt={logoObj.name || `Client ${idx + 1}`} 
                            className="max-w-full max-h-full object-contain transform transition-transform duration-300 group-hover:scale-110" 
                          />
                        )}
                      </div>
                      
                      {logoObj.name && (
                        <div className="text-center w-full px-2">
                          {logoObj.website_url ? (
                            <a 
                              href={logoObj.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm font-semibold text-industrial-800 hover:text-primary-600 transition-colors line-clamp-1"
                            >
                              {logoObj.name}
                            </a>
                          ) : (
                            <span className="text-sm font-semibold text-industrial-800 line-clamp-1">
                              {logoObj.name}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features/Stats Section */}
      <section className="py-16 bg-white border-b border-industrial-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-1 md:grid-cols-${Math.min((content.stat_cards || []).length || 3, 4)} gap-8 text-center`}>
            {(content.stat_cards || [
              { icon: 'Factory', title: '38+ Years', description: 'Of manufacturing excellence and innovation in industrial engineering.' },
              { icon: 'ShieldCheck', title: 'ISO 9001', description: 'Certified for design, manufacturing, and supply of robust equipment.' },
              { icon: 'Settings', title: '1500+ Clients', description: 'Satisfied customers globally, delivering turnkey handling solutions.' },
            ]).map((card: any, index: number) => {
              const iconMap: Record<string, any> = { Factory, ShieldCheck, Settings, Award, Users, Cpu, Zap, Globe };
              const IconComponent = iconMap[card.icon] || Settings;
              return (
                <div key={index} className="p-6 rounded-xl bg-industrial-50 border border-industrial-100 shadow-sm">
                  <IconComponent className="h-10 w-10 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
                  <p className="text-industrial-600">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-20 bg-industrial-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-heading font-bold mb-6 text-industrial-900">Pioneering Automatic Weighing in India</h2>
            <p className="text-industrial-600 mb-6 leading-relaxed">
              Tyco pioneered the concept of automatic weighing in India with technical support from a German company. We supply systems for applications ranging from lumpy to fine powders up to 10 microns.
            </p>
            <Link to="/company-profile" className="text-primary-600 font-semibold hover:text-primary-700 flex items-center">
              Read Our Full Story <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="md:w-1/2">
            <div className="aspect-w-16 aspect-h-9 bg-industrial-200 rounded-xl overflow-hidden shadow-lg border border-industrial-300 flex items-center justify-center">
              {/* Replace with actual image later */}
              <span className="text-industrial-500 font-medium">Factory Image Placeholder</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
