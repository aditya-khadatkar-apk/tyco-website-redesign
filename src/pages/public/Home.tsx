import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Settings, Factory, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div>
      <Helmet>
        <title>Tyco India - Industrial Solutions</title>
        <meta name="description" content="Modern, high-performance industrial equipment, pulverisers, classifiers, and crushers by Tyco India since 1977." />
      </Helmet>
      
      {/* Hero Section */}
      <section className="relative bg-industrial-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-industrial-900 to-industrial-800 opacity-90"></div>
        {/* Placeholder for future background image if needed */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 flex flex-col items-start">
          <h1 className="text-4xl md:text-6xl font-heading font-extrabold tracking-tight mb-6 text-white max-w-3xl">
            Precision <span className="text-primary-500">Industrial Equipment</span> for Modern Manufacturing.
          </h1>
          <p className="text-lg md:text-xl text-industrial-300 max-w-2xl mb-10 leading-relaxed">
            Since 1977, Tyco India has engineered reliable pulverisers, classifiers, and material handling systems for over 1500 satisfied clients worldwide.
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

      {/* Features/Stats Section */}
      <section className="py-16 bg-white border-b border-industrial-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-xl bg-industrial-50 border border-industrial-100 shadow-sm">
              <Factory className="h-10 w-10 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">38+ Years</h3>
              <p className="text-industrial-600">Of manufacturing excellence and innovation in industrial engineering.</p>
            </div>
            <div className="p-6 rounded-xl bg-industrial-50 border border-industrial-100 shadow-sm">
              <ShieldCheck className="h-10 w-10 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">ISO 9001</h3>
              <p className="text-industrial-600">Certified for design, manufacturing, and supply of robust equipment.</p>
            </div>
            <div className="p-6 rounded-xl bg-industrial-50 border border-industrial-100 shadow-sm">
              <Settings className="h-10 w-10 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">1500+ Clients</h3>
              <p className="text-industrial-600">Satisfied customers globally, delivering turnkey handling solutions.</p>
            </div>
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
