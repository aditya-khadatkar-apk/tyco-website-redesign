import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Box, CheckCircle2, MessageSquare, Download, Share2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  image_url: string;
  catalogue_url: string;
  video_url: string;
  specs: any;
}

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-industrial-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-industrial-50 px-4 text-center">
        <Box className="w-20 h-20 text-industrial-300 mb-6" />
        <h1 className="text-3xl font-heading font-bold text-industrial-900 mb-4">Product Not Found</h1>
        <p className="text-industrial-600 mb-8 max-w-md">The product you are looking for might have been moved or is no longer available.</p>
        <Link to="/products" className="bg-primary-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors inline-flex items-center">
          <ArrowLeft className="mr-2 h-5 w-5" /> Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white pb-20">
      <Helmet>
        <title>{product.name} | Tyco India Private Limited</title>
        <meta name="description" content={product.description.replace(/<[^>]*>/g, '').slice(0, 160)} />
      </Helmet>

      {/* Breadcrumbs & Navigation */}
      <div className="bg-industrial-50 border-b border-industrial-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center text-sm text-industrial-500">
            <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-industrial-900 font-medium truncate">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Image (smaller) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-xl border border-industrial-200 overflow-hidden relative group shadow-sm">
              <div className="aspect-[4/3] relative">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-industrial-50">
                    <Box className="w-20 h-20 text-industrial-200" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {product.catalogue_url && (
                <a 
                  href={product.catalogue_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-white hover:bg-industrial-50 text-industrial-700 py-2.5 rounded-lg font-semibold text-sm border border-industrial-200 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Catalogue
                </a>
              )}
              {product.video_url && (
                <a 
                  href={product.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1 bg-white hover:bg-industrial-50 text-industrial-700 py-2.5 rounded-lg font-semibold text-sm border border-industrial-200 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Watch Video
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="mb-6">
              <span className="text-primary-600 font-bold uppercase tracking-widest text-[10px] mb-2 block">
                {product.category || 'Industrial Equipment'}
              </span>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-industrial-900 mb-4 leading-tight">
                {product.name}
              </h1>
              <div 
                className="prose prose-sm prose-industrial max-w-none text-industrial-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>

            {/* Specifications Section */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-bold text-industrial-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary-600" /> Technical Specifications
                </h3>
                <div className="bg-white rounded-lg border border-industrial-100 overflow-hidden shadow-sm">
                  <table className="w-full text-xs">
                    <tbody>
                      {Object.entries(product.specs).map(([key, value], idx) => (
                        <tr key={key} className={idx % 2 === 0 ? 'bg-white' : 'bg-industrial-50/30'}>
                          <td className="px-4 py-2.5 font-semibold text-industrial-700 w-1/3 border-b border-industrial-100">{key}</td>
                          <td className="px-4 py-2.5 text-industrial-600 border-b border-industrial-100">{value as string}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Cleaner CTA Section */}
            <div className="bg-industrial-50 rounded-xl p-6 border border-industrial-200 relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg font-bold text-industrial-900 mb-1">Interested in this product?</h3>
                  <p className="text-industrial-500 text-sm">Request a quote or technical consultation today.</p>
                </div>
                <Link 
                  to={`/contact-us?product=${encodeURIComponent(product.name)}`}
                  className="whitespace-nowrap bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-600/10 flex items-center text-sm"
                >
                  <MessageSquare className="mr-2 h-4 w-4" /> Request a Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
