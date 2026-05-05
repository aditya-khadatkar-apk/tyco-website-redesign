import { Helmet } from 'react-helmet-async';
import { useCMS } from '../../hooks/useCMS';
import { Loader2 } from 'lucide-react';

export default function CompanyProfile() {
  const { content, loading } = useCMS('company-profile');

  return (
    <div className="bg-white pb-20">
      <Helmet>
        <title>Company Profile | Tyco India Private Limited</title>
        <meta name="description" content="Learn about Tyco India, manufacturing a large range of Industrial Equipment since 1977." />
      </Helmet>

      {/* Page Header */}
      <div className="relative bg-industrial-900 py-16 mb-12 overflow-hidden">
        {content.header_image && (
          <div className="absolute inset-0 z-0">
            <img src={content.header_image} alt="Header Background" className="w-full h-full object-cover mix-blend-overlay opacity-40" />
          </div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
            Company <span className="text-primary-500">Profile</span>
          </h1>
          <p className="text-industrial-300 text-lg">A Legacy of Quality and Reliability since 1977</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
           <div className="flex justify-center items-center py-20">
             <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
           </div>
        ) : (
          <div 
            className="prose prose-industrial prose-lg max-w-none text-industrial-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content.body }}
          />
        )}
      </div>
    </div>
  );
}
