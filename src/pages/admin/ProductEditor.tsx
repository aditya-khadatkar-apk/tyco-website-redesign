import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';
import ImageUpload from '../../components/ImageUpload';

export default function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [catalogueUrl, setCatalogueUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [specs, setSpecs] = useState<{ key: string, value: string }[]>([]);

  useEffect(() => {
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setName(data.name || '');
      setSlug(data.slug || '');
      setCategory(data.category || '');
      setDescription(data.description || '');
      setImageUrl(data.image_url || '');
      setCatalogueUrl(data.catalogue_url || '');
      setVideoUrl(data.video_url || '');
      
      // Convert JSON specs to array format for editor
      if (data.specs) {
        const specArr = Object.entries(data.specs).map(([key, value]) => ({
          key,
          value: value as string
        }));
        setSpecs(specArr);
      }
      
    } catch (error) {
      console.error('Error fetching product:', error);
      setMessage({ type: 'error', text: 'Failed to load product data.' });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isEditing) {
      setSlug(generateSlug(newName));
    }
  };

  const addSpec = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    // Convert specs array back to JSON object
    const specsJson = specs.reduce((acc, curr) => {
      if (curr.key.trim()) {
        acc[curr.key.trim()] = curr.value.trim();
      }
      return acc;
    }, {} as Record<string, string>);

    const payload = {
      name,
      slug,
      category,
      description,
      image_url: imageUrl,
      catalogue_url: catalogueUrl,
      video_url: videoUrl,
      specs: specsJson,
    };

    try {
      if (isEditing) {
        const { error } = await supabase.from('products').update(payload).eq('id', id);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Product updated successfully.' });
      } else {
        const { error } = await supabase.from('products').insert([payload]);
        if (error) throw error;
        navigate('/admin/products');
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      // Handle unique constraint error on slug
      if (error.code === '23505') {
         setMessage({ type: 'error', text: 'A product with this slug already exists.' });
      } else {
         setMessage({ type: 'error', text: error.message || 'Error saving product.' });
      }
    } finally {
      setSaving(false);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>{isEditing ? `Edit ${name}` : 'Add New Product'} - Admin Portal</title>
      </Helmet>

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/admin/products" className="mr-4 p-2 bg-white rounded-full border border-industrial-200 text-industrial-600 hover:text-primary-600 hover:border-primary-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-heading font-bold text-industrial-900">
              {isEditing ? 'Edit Product' : 'Add New Product'}
            </h1>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md flex items-start text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-industrial-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6 text-industrial-900 border-b border-industrial-100 pb-2">Basic Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-industrial-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={handleNameChange}
                  className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. Heavy Duty Pulveriser"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-700 mb-1">URL Slug <span className="text-red-500">*</span></label>
                <div className="flex items-center">
                  <span className="text-industrial-500 bg-industrial-50 border border-r-0 border-industrial-300 px-3 py-2 rounded-l-md text-sm">
                    /products/
                  </span>
                  <input 
                    type="text" 
                    required
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    className="flex-1 px-4 py-2 border border-industrial-300 rounded-r-md focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="heavy-duty-pulveriser"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-700 mb-1">Category</label>
                <input 
                  type="text" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder="e.g. Pulverisers"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-industrial-700 mb-1">Catalogue URL (PDF)</label>
                  <input 
                    type="text" 
                    value={catalogueUrl}
                    onChange={(e) => setCatalogueUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-industrial-700 mb-1">Video URL (YouTube)</label>
                  <input 
                    type="text" 
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="https://youtube.com/..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-industrial-700 mb-2">Description</label>
                <RichTextEditor 
                  content={description}
                  onChange={(html) => setDescription(html)}
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white rounded-xl shadow-sm border border-industrial-200 p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-industrial-100 pb-2 mb-6">
              <h2 className="text-xl font-semibold text-industrial-900">Technical Specifications</h2>
              <button 
                type="button" 
                onClick={addSpec}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Spec
              </button>
            </div>
            
            {specs.length === 0 ? (
              <p className="text-industrial-500 text-sm text-center py-4 bg-industrial-50 rounded-md border border-industrial-100 border-dashed">
                No specifications added yet.
              </p>
            ) : (
              <div className="space-y-3">
                {specs.map((spec, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        value={spec.key}
                        onChange={(e) => updateSpec(index, 'key', e.target.value)}
                        placeholder="e.g. Capacity"
                        className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm outline-none focus:border-primary-500"
                      />
                    </div>
                    <div className="flex-[2]">
                      <input 
                        type="text" 
                        value={spec.value}
                        onChange={(e) => updateSpec(index, 'value', e.target.value)}
                        placeholder="e.g. 500kg/hr"
                        className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm outline-none focus:border-primary-500"
                      />
                    </div>
                    <button 
                      type="button"
                      onClick={() => removeSpec(index)}
                      className="p-2 text-industrial-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-industrial-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-industrial-900 border-b border-industrial-100 pb-2">Publishing</h2>
            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white py-3 rounded-md font-semibold transition-colors flex justify-center items-center disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
              {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Publish Product')}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-industrial-200 p-6">
            <h2 className="text-lg font-semibold mb-4 text-industrial-900 border-b border-industrial-100 pb-2">Product Image</h2>
            <ImageUpload 
              url={imageUrl}
              onUpload={setImageUrl}
              folder="products"
            />
            <p className="text-xs text-industrial-500 mt-4 text-center">
              Recommended size: 800x600px
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}
