import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../lib/supabase';
import { ArrowRight, Loader2, Box } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  specs: any;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();

    const channel = supabase.channel('public:products')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('[Products Realtime] Data updated:', payload);
          fetchProducts(); // Refetch products list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-industrial-50 pb-20 min-h-screen">
      <Helmet>
        <title>Our Products | Tyco India Private Limited</title>
        <meta name="description" content="Explore our range of Pulverisers, Centrifugal Classifiers, Automatic Weighing Systems, and Crushers." />
      </Helmet>

      {/* Page Header */}
      <div className="bg-industrial-900 py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
            Our <span className="text-primary-500">Products</span>
          </h1>
          <p className="text-industrial-300 text-lg max-w-2xl mx-auto">
            Engineered for performance, built for reliability. Discover our comprehensive range of industrial processing equipment.
          </p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Box className="w-16 h-16 text-industrial-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-industrial-900 mb-2">No Products Yet</h3>
            <p className="text-industrial-600">Our catalog is currently being updated. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-md border border-industrial-200 overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col">
                <div className="h-56 bg-industrial-100 overflow-hidden relative">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-industrial-200">
                      <Box className="w-12 h-12 text-industrial-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-industrial-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-2xl font-bold text-industrial-900 mb-3 font-heading">{product.name}</h3>
                  <div 
                    className="text-industrial-600 mb-6 line-clamp-3 text-sm flex-grow"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                  
                  {/* Simplified Specs Preview */}
                  {product.specs && Object.keys(product.specs).length > 0 && (
                    <div className="mb-6 space-y-2">
                      {Object.entries(product.specs).slice(0, 2).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm border-b border-industrial-100 pb-1">
                          <span className="text-industrial-500 font-medium">{key}</span>
                          <span className="text-industrial-900 font-semibold">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Link 
                    to={`/products/${product.slug}`} 
                    className="mt-auto inline-flex items-center justify-center w-full bg-industrial-50 hover:bg-primary-50 text-primary-700 font-semibold py-3 px-4 border border-industrial-200 hover:border-primary-200 rounded-md transition-colors"
                  >
                    View Details <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
