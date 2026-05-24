import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Box, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  created_at: string;
}

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();

    const channel = supabase.channel('public:products-manager')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          console.log('[ProductsManager Realtime] Data updated:', payload);
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, image_url, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeleteId(id);
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product.');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Products Manager - Admin Portal</title>
      </Helmet>

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-industrial-900 flex items-center">
            <Box className="mr-3 h-8 w-8 text-primary-600" />
            Product Catalog
          </h1>
          <p className="text-industrial-600 mt-2">Manage your equipment, specifications, and images.</p>
        </div>
        
        <Link
          to="/admin/products/new"
          className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-md font-semibold transition-colors flex items-center justify-center w-fit"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-industrial-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Box className="w-16 h-16 text-industrial-300 mb-4" />
            <h3 className="text-xl font-bold text-industrial-900 mb-2">No Products Found</h3>
            <p className="text-industrial-600 mb-6 max-w-md">You haven't added any products to your catalog yet. Start by creating your first product.</p>
            <Link
              to="/admin/products/new"
              className="text-primary-600 font-medium hover:text-primary-700"
            >
              + Create Product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-industrial-600">
              <thead className="bg-industrial-50 text-xs uppercase text-industrial-500 font-semibold border-b border-industrial-200">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Slug (URL)</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-industrial-50 transition-colors">
                    <td className="px-6 py-4">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded-md border border-industrial-200" />
                      ) : (
                        <div className="w-16 h-16 bg-industrial-100 rounded-md flex items-center justify-center border border-industrial-200">
                          <Box className="w-6 h-6 text-industrial-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-industrial-900 text-base">{product.name}</td>
                    <td className="px-6 py-4 font-mono text-xs bg-industrial-50 rounded px-2">{product.slug}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-3">
                        <Link 
                          to={`/admin/products/edit/${product.id}`}
                          className="text-industrial-500 hover:text-primary-600 transition-colors p-2"
                          title="Edit"
                        >
                          <Pencil className="w-5 h-5" />
                        </Link>
                        <button 
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this product?')) {
                              handleDelete(product.id);
                            }
                          }}
                          disabled={deleteId === product.id}
                          className="text-industrial-500 hover:text-red-600 transition-colors p-2 disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteId === product.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
