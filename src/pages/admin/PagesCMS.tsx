import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { Save, Loader2, FileEdit, CheckCircle2 } from 'lucide-react';
import RichTextEditor from '../../components/RichTextEditor';
import ImageUpload from '../../components/ImageUpload';

// Simple deep equality check for JSON objects
const isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b);

interface CMSSectionProps {
  id: string;
  title: string;
  description?: string;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  children: React.ReactNode;
}

const CMSSection = ({ 
  title, 
  description, 
  dirty,
  saving,
  onSave,
  children 
}: CMSSectionProps) => {
  return (
    <div className="pt-8 first:pt-0 border-t first:border-t-0 border-industrial-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-industrial-900">{title}</h3>
            {dirty && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-200">
                Modified
              </span>
            )}
          </div>
          {description && <p className="text-sm text-industrial-500 mt-1">{description}</p>}
        </div>
        
        <button
          onClick={onSave}
          disabled={!dirty || saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
            dirty 
              ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm' 
              : 'bg-industrial-100 text-industrial-400 cursor-not-allowed'
          }`}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Section'}
        </button>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

const PAGES = [
  { slug: 'home', label: 'Home Page' },
  { slug: 'company-profile', label: 'Company Profile' },
  { slug: 'clients', label: 'Clients' },
  { slug: 'contact-us', label: 'Contact Us' },
];

const ICON_OPTIONS = ['Factory', 'ShieldCheck', 'Settings', 'Award', 'Users', 'Cpu', 'Zap', 'Globe'];

const DEFAULT_CONTENT: Record<string, any> = {
  'home': {
    hero_title: 'Precision Industrial Equipment for Modern Manufacturing.',
    hero_subtitle: 'Since 1977, Tyco India has engineered reliable pulverisers, classifiers, and material handling systems for over 1500 satisfied clients worldwide.',
    hero_image: '',
    stat_cards: [
      { icon: 'Factory', title: '38+ Years', description: 'Of manufacturing excellence and innovation in industrial engineering.' },
      { icon: 'ShieldCheck', title: 'ISO 9001', description: 'Certified for design, manufacturing, and supply of robust equipment.' },
      { icon: 'Settings', title: '1500+ Clients', description: 'Satisfied customers globally, delivering turnkey handling solutions.' },
    ]
  },
  'company-profile': {
    header_image: '',
    body: '<p>TYCO was incorporated on 15th of September, 1977. The Company manufactures a large range of Industrial Equipment at its Nagpur factory. All products of the Company are well accepted in the Indian Market for their quality and reliability. During its nearly 38+ years of existence the Company has successfully carved a niche for itself among quality conscious users in India and abroad and has over 1500 satisfied customers through-out India.</p><p>Tyco pioneered the concept of automatic weighing in India with technical support from a German company establishing a second factory in Nagpur. Tyco has supplied automatic weighing systems in India and abroad for applications ranging from lumpy and granular to fine powders upto a fineness of 10 microns. The end users who use our systems are Sugar, Chemicals, Polyester Chips, Refractory Manufacturers, and Mineral Processors, Fertilizers, Spices, Cattle Feed, Deoiled Cakes, Sponge Iron, Rice Exporters, Flour, Pigment, Calcined Bauxite, Titanium Dioxide etc.</p><p>The factory at Nagpur also has extensive manufacturing facilities for Minerals Processing Equipment.</p><h2>Our Product Range</h2><p>Tyco Product range includes, Automatic Weighing, Bagging Systems from 1Kg to 1 ton, Pulverizers, Centrifugal type Air Classifiers, Double toggle type Jaw & Stone Crushers, Process line & Packing Line Conveyors, Truck Loader, Stacker, Screw Conveyors, and Bucket Elevators.</p><p><strong>Over 700 Bagging Machines, 950 Pulverisers, 60 Centrifugal Classifiers, and 500 Vibrators are working in the field.</strong></p><h2>Our Valued Customers</h2><p>TYCO customers include ITC, Hindustan Lever, Tata Chemicals, TISCO, Tata Sponge, Rourkela Steel Plant, Durgapur Steel Plant, Bokaro Steel Plant, EID Parry, Dabur Industries, Indian Aluminium Co, ESSAR Gujarat, Jindal Steel, amongst a large number of other users. TYCO equipment are in use in these markets for over a decade and enjoy favored status.</p><p>In 2000 the manufacturing operations were consolidated in Nagpur.</p><blockquote>"Tyco products are designed, manufactured, and supplied, as per ISO 9001 standards"</blockquote><p>Tyco undertakes supply of weighing systems along with turnkey supply of material handling in various combinations to suit customer requirements including Storage Silos, Bucket Elevators, Conveyors, Lorry Loaders, and Stitching Machine etc.</p><p>Tyco belongs to a professionally owned and run group of companies with the vision to give world-class technologies and products to its customers. We have state of the art systems and infrastructure to provide excellent after market services. Has emerged as People Oriented, Growing Company with strong customer orientation.</p><p>Tyco is in discussion with a few companies to bring newer and better technologies and products to the Indian market providing better value proposition.</p>'
  },
  'contact-us': {
    header_image: '',
    contacts: [
      {
        title: 'Corporate Office & Factory',
        address: 'Nagpur Factory, Maharashtra, India',
        phone: '+91 XXXXX XXXXX',
        email: 'info@tyco-india.com'
      }
    ],
    inquiry_options: 'General Inquiry\nPulverisers\nClassifiers\nMaterial Handling\nAfter Sales Support'
  },
  'clients': {
    hero_title: 'Trusted by 1500+ Industry Leaders',
    hero_subtitle: 'Over 700 machines are working in India for various applications. Our clients include blue chips such as Tata Sponge Iron Ltd., Jindal Steel and Power Ltd., and many more.',
    hero_image: '',
    stats: [
      { number: '700+', label: 'Bagging Machines Deployed' },
      { number: '950+', label: 'Pulverisers in Operation' },
      { number: '60+', label: 'Centrifugal Classifiers' },
      { number: '500+', label: 'Vibrators in the Field' },
    ],
    featured_clients: [],
    state_presence: {
      mh: true, mp: true, cg: true, or: true, jh: true, wb: true, br: true, up: true,
      rj: true, gj: true, hr: true, pb: true, dl: true, uk: true, ka: true, tn: true,
      ap: true, ts: true, kl: true, ga: true, ne: true, as: true, hp: true,
    },
    categories: [
      { name: 'Steel, Iron & Metals', clients: 'Tata Sponge Iron Ltd.\nJindal Steel & Power Ltd.\nEssar Steel' },
      { name: 'Sugar Mills', clients: 'Balrampur Chini Mills Ltd.\nDhampur Sugar Mills\nEID Parry (India) Ltd.' },
      { name: 'Chemicals & Minerals', clients: 'ICI Limited\nFoseco India Limited\nAnirox Pigments Ltd.' },
      { name: 'Food, Pharma & Agro', clients: 'Dabur India Ltd.\nRajdhani Flour Mills\nPepsi Foods Pvt. Ltd.' },
      { name: 'Engineering & General', clients: 'Reliance Industries Ltd.\nIndian Aluminium Co. Ltd.\nEicher Goodearth Ltd.' },
    ],
  }
};

export default function PagesCMS() {
  const [activePage, setActivePage] = useState(PAGES[0].slug);
  const [content, setContent] = useState<any>({});
  const [initialContent, setInitialContent] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSectionSaving, setActiveSectionSaving] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [contentKey, setContentKey] = useState(0);

  useEffect(() => {
    fetchPageContent();
  }, [activePage]);

  const fetchPageContent = async () => {
    setLoading(true);
    setSaveMessage('');
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('content')
        .eq('slug', activePage)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Merge default content with whatever is in the database to prevent missing fields
      const dbContent = data?.content || {};
      const mergedContent = { ...DEFAULT_CONTENT[activePage], ...dbContent };
      setContent(mergedContent);
      setInitialContent(JSON.parse(JSON.stringify(mergedContent))); // Deep copy
      setContentKey(prev => prev + 1); // Force re-mount of editors
    } catch (error) {
      console.error('Error fetching page content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Legacy save all - still useful as a fallback
    setSaving(true);
    setSaveMessage('');
    try {
      const { error } = await supabase
        .from('pages')
        .upsert(
          { slug: activePage, content, updated_at: new Date().toISOString() }, 
          { onConflict: 'slug' }
        );

      if (error) throw error;
      setInitialContent(JSON.parse(JSON.stringify(content)));
      setSaveMessage('All changes saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveMessage('Error saving changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSection = async (sectionId: string, keys: string[]) => {
    setActiveSectionSaving(sectionId);
    setSaveMessage('');
    
    // Extract only the fields for this section
    const changes: Record<string, any> = {};
    keys.forEach(key => {
      changes[key] = content[key];
    });

    try {
      const { error } = await supabase.rpc('update_page_content', {
        p_slug: activePage,
        p_new_content: changes
      });

      if (error) throw error;
      
      // Update initialContent for these keys
      setInitialContent((prev: any) => ({ ...prev, ...changes }));
      setSaveMessage(`${sectionId.charAt(0).toUpperCase() + sectionId.slice(1).replace(/-/g, ' ')} saved successfully!`);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error(`Error saving section ${sectionId}:`, error);
      setSaveMessage(`Error saving ${sectionId}.`);
    } finally {
      setActiveSectionSaving(null);
    }
  };

  const isSectionDirty = (keys: string[]) => {
    return keys.some(key => !isEqual(content[key], initialContent[key]));
  };


  const updateField = (key: string, value: any) => {
    setContent((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateContactField = (index: number, key: string, value: string) => {
    setContent((prev: any) => {
      const contacts = prev.contacts ? [...prev.contacts] : [];
      if (!contacts[index]) contacts[index] = {};
      contacts[index][key] = value;
      return { ...prev, contacts };
    });
  };

  const addContact = () => {
    setContent((prev: any) => {
      const contacts = prev.contacts ? [...prev.contacts] : [];
      if (contacts.length >= 3) return prev;
      return { ...prev, contacts: [...contacts, { title: '', address: '', phone: '', email: '' }] };
    });
  };

  const removeContact = (index: number) => {
    setContent((prev: any) => {
      const contacts = prev.contacts ? [...prev.contacts] : [];
      contacts.splice(index, 1);
      return { ...prev, contacts };
    });
  };

  const addClientLogo = () => {
    setContent((prev: any) => {
      const logos = prev.client_logos ? [...prev.client_logos] : [];
      return { ...prev, client_logos: [...logos, { image_url: '', name: '', website_url: '' }] };
    });
  };

  const updateClientLogo = (index: number, key: string, value: string) => {
    setContent((prev: any) => {
      const logos = prev.client_logos ? [...prev.client_logos] : [];
      if (typeof logos[index] === 'string') {
        logos[index] = { image_url: logos[index], name: '', website_url: '' };
      } else if (!logos[index]) {
        logos[index] = { image_url: '', name: '', website_url: '' };
      }
      logos[index][key] = value;
      return { ...prev, client_logos: logos };
    });
  };

  // --- Clients Page: Stats ---
  const addStat = () => {
    setContent((prev: any) => {
      const stats = prev.stats ? [...prev.stats] : [];
      if (stats.length >= 6) return prev;
      return { ...prev, stats: [...stats, { number: '', label: '' }] };
    });
  };

  const updateStat = (index: number, key: string, value: string) => {
    setContent((prev: any) => {
      const stats = prev.stats ? [...prev.stats] : [];
      if (!stats[index]) stats[index] = {};
      stats[index][key] = value;
      return { ...prev, stats };
    });
  };

  const removeStat = (index: number) => {
    setContent((prev: any) => {
      const stats = prev.stats ? [...prev.stats] : [];
      stats.splice(index, 1);
      return { ...prev, stats };
    });
  };

  // --- Clients Page: Categories ---
  const addCategory = () => {
    setContent((prev: any) => {
      const categories = prev.categories ? [...prev.categories] : [];
      return { ...prev, categories: [...categories, { name: '', clients: '' }] };
    });
  };

  const updateCategory = (index: number, key: string, value: string) => {
    setContent((prev: any) => {
      const categories = prev.categories ? [...prev.categories] : [];
      if (!categories[index]) categories[index] = {};
      categories[index][key] = value;
      return { ...prev, categories };
    });
  };

  const removeCategory = (index: number) => {
    setContent((prev: any) => {
      const categories = prev.categories ? [...prev.categories] : [];
      categories.splice(index, 1);
      return { ...prev, categories };
    });
  };

  // --- Clients Page: State Presence ---
  const toggleStatePresence = (stateId: string) => {
    setContent((prev: any) => {
      const sp = prev.state_presence ? { ...prev.state_presence } : {};
      sp[stateId] = !sp[stateId];
      return { ...prev, state_presence: sp };
    });
  };

  // --- Home Page: Stat Cards ---
  const addStatCard = () => {
    setContent((prev: any) => {
      const cards = prev.stat_cards ? [...prev.stat_cards] : [];
      if (cards.length >= 6) return prev;
      return { ...prev, stat_cards: [...cards, { icon: 'Settings', title: '', description: '' }] };
    });
  };

  const updateStatCard = (index: number, key: string, value: string) => {
    setContent((prev: any) => {
      const cards = prev.stat_cards ? [...prev.stat_cards] : [];
      if (!cards[index]) cards[index] = {};
      cards[index][key] = value;
      return { ...prev, stat_cards: cards };
    });
  };

  const removeStatCard = (index: number) => {
    setContent((prev: any) => {
      const cards = prev.stat_cards ? [...prev.stat_cards] : [];
      cards.splice(index, 1);
      return { ...prev, stat_cards: cards };
    });
  };

  // --- Featured Client (reused for clients page) ---
  const addFeaturedClient = () => {
    setContent((prev: any) => {
      const clients = prev.featured_clients ? [...prev.featured_clients] : [];
      return { ...prev, featured_clients: [...clients, { image_url: '', name: '', website_url: '' }] };
    });
  };

  const updateFeaturedClient = (index: number, key: string, value: string) => {
    setContent((prev: any) => {
      const clients = prev.featured_clients ? [...prev.featured_clients] : [];
      if (!clients[index]) clients[index] = { image_url: '', name: '', website_url: '' };
      clients[index][key] = value;
      return { ...prev, featured_clients: clients };
    });
  };

  const removeFeaturedClient = (index: number) => {
    setContent((prev: any) => {
      const clients = prev.featured_clients ? [...prev.featured_clients] : [];
      clients.splice(index, 1);
      return { ...prev, featured_clients: clients };
    });
  };

  const removeClientLogo = (index: number) => {
    setContent((prev: any) => {
      const logos = prev.client_logos ? [...prev.client_logos] : [];
      logos.splice(index, 1);
      return { ...prev, client_logos: logos };
    });
  };

  return (
    <div>
      <Helmet>
        <title>Pages CMS - Admin Portal</title>
      </Helmet>

      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-industrial-900 flex items-center">
            <FileEdit className="mr-3 h-8 w-8 text-primary-600" />
            Content Management
          </h1>
          <p className="text-industrial-600 mt-2">Edit text and images for the public pages.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={loading || saving}
          className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2 rounded-md font-semibold transition-colors flex items-center justify-center disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar / Tabs */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-industrial-200 overflow-hidden">
            <div className="p-4 bg-industrial-50 border-b border-industrial-200 font-semibold text-industrial-900">
              Select Page
            </div>
            <div className="flex flex-col">
              {PAGES.map((page) => (
                <button
                  key={page.slug}
                  onClick={() => setActivePage(page.slug)}
                  className={`px-4 py-3 text-left transition-colors border-l-4 ${
                    activePage === page.slug 
                      ? 'border-primary-600 bg-primary-50 text-primary-700 font-medium' 
                      : 'border-transparent hover:bg-industrial-50 text-industrial-600'
                  }`}
                >
                  {page.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="lg:w-3/4">
          <div className="bg-white rounded-xl shadow-sm border border-industrial-200 p-6 md:p-8">
            {saveMessage && (
              <div className={`mb-6 p-4 rounded-md flex items-center ${saveMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {saveMessage.includes('Error') ? null : <CheckCircle2 className="w-5 h-5 mr-2" />}
                {saveMessage}
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Home Page Fields */}
                {activePage === 'home' && (
                  <>
                    <CMSSection 
                      id="hero-section" 
                      title="Hero Section" 
                      description="Main headline and background image seen at the top of the home page."
                      dirty={isSectionDirty(['hero_title', 'hero_subtitle', 'hero_image'])}
                      saving={activeSectionSaving === 'hero-section'}
                      onSave={() => handleSaveSection('hero-section', ['hero_title', 'hero_subtitle', 'hero_image'])}
                    >
                      <div>
                        <label className="block text-sm font-semibold text-industrial-900 mb-2">Hero Headline</label>
                        <input 
                          type="text" 
                          value={content.hero_title || ''} 
                          onChange={(e) => updateField('hero_title', e.target.value)}
                          className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          placeholder="e.g. Precision Industrial Equipment"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-industrial-900 mb-2">Hero Subtitle</label>
                        <textarea 
                          value={content.hero_subtitle || ''} 
                          onChange={(e) => updateField('hero_subtitle', e.target.value)}
                          className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-industrial-900 mb-2">Hero Background Image</label>
                        <ImageUpload 
                          url={content.hero_image || ''} 
                          onUpload={(url) => updateField('hero_image', url)} 
                          folder="home"
                        />
                      </div>
                    </CMSSection>

                    <CMSSection 
                      id="client-logos" 
                      title="Client Logos" 
                      description="Trust signals showing prominent clients in the scrolling banner."
                      dirty={isSectionDirty(['client_logos'])}
                      saving={activeSectionSaving === 'client-logos'}
                      onSave={() => handleSaveSection('client-logos', ['client_logos'])}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-industrial-700">Logo Gallery</h4>
                        <button 
                          onClick={addClientLogo}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                        >
                          + Add Logo
                        </button>
                      </div>
                      
                      {content.client_logos && content.client_logos.length > 0 ? (
                        <div className="space-y-6 mb-6">
                          {content.client_logos.map((logo: any, index: number) => {
                            // Normalize legacy string format
                            const logoObj = typeof logo === 'string' ? { image_url: logo, name: '', website_url: '' } : logo;
                            return (
                              <div key={index} className="p-4 bg-industrial-50 border border-industrial-200 rounded-lg relative">
                                <div className="flex justify-between items-center mb-4">
                                  <h4 className="font-medium text-industrial-900">Client {index + 1}</h4>
                                  <button 
                                    onClick={() => removeClientLogo(index)}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                  >
                                    Remove
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-industrial-700 mb-1">Logo Image</label>
                                    <ImageUpload 
                                      url={logoObj.image_url || ''} 
                                      onUpload={(url) => updateClientLogo(index, 'image_url', url)} 
                                      folder="home/clients"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-industrial-700 mb-1">Client Name</label>
                                    <input 
                                      type="text" 
                                      value={logoObj.name || ''} 
                                      onChange={(e) => updateClientLogo(index, 'name', e.target.value)}
                                      className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm"
                                      placeholder="e.g. Tyco International"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-semibold text-industrial-700 mb-1">Website URL (Optional)</label>
                                    <input 
                                      type="url" 
                                      value={logoObj.website_url || ''} 
                                      onChange={(e) => updateClientLogo(index, 'website_url', e.target.value)}
                                      className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm"
                                      placeholder="https://..."
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-industrial-500 pb-4">No client logos added yet. Click "+ Add Logo" to add one.</p>
                      )}
                    </CMSSection>

                    <CMSSection 
                      id="stats-cards" 
                      title="Stats & Feature Cards" 
                      description="Key highlights showing experience and certifications."
                      dirty={isSectionDirty(['stat_cards'])}
                      saving={activeSectionSaving === 'stats-cards'}
                      onSave={() => handleSaveSection('stats-cards', ['stat_cards'])}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-industrial-700">Display Cards</h4>
                        <button onClick={addStatCard} className="text-primary-600 hover:text-primary-700 text-sm font-medium">+ Add Card</button>
                      </div>
                      {content.stat_cards && content.stat_cards.length > 0 ? (
                        <div className="space-y-4">
                          {content.stat_cards.map((card: any, index: number) => (
                            <div key={index} className="p-4 bg-industrial-50 border border-industrial-200 rounded-lg">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium text-industrial-900">Card {index + 1}</h4>
                                <button onClick={() => removeStatCard(index)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs font-semibold text-industrial-700 mb-1">Icon</label>
                                  <select
                                    value={card.icon || 'Settings'}
                                    onChange={(e) => updateStatCard(index, 'icon', e.target.value)}
                                    className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm"
                                  >
                                    {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-industrial-700 mb-1">Title</label>
                                  <input type="text" value={card.title || ''} onChange={(e) => updateStatCard(index, 'title', e.target.value)} className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm" placeholder="e.g. 38+ Years" />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-industrial-700 mb-1">Description</label>
                                  <input type="text" value={card.description || ''} onChange={(e) => updateStatCard(index, 'description', e.target.value)} className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm" placeholder="Brief description..." />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-industrial-500">No stat cards. Click "+ Add Card" to add one.</p>
                      )}
                    </CMSSection>
                  </>
                )}

                {/* Company Profile Fields */}
                {activePage === 'company-profile' && (
                  <>
                    <CMSSection 
                      id="company-header" 
                      title="Page Header" 
                      description="Banner image at the top of the company profile page."
                      dirty={isSectionDirty(['header_image'])}
                      saving={activeSectionSaving === 'company-header'}
                      onSave={() => handleSaveSection('company-header', ['header_image'])}
                    >
                      <ImageUpload 
                        url={content.header_image || ''} 
                        onUpload={(url) => updateField('header_image', url)} 
                        folder="company-profile"
                      />
                    </CMSSection>

                    <CMSSection 
                      id="company-body" 
                      title="Profile Content" 
                      description="Main biography and history of Tyco India."
                      dirty={isSectionDirty(['body'])}
                      saving={activeSectionSaving === 'company-body'}
                      onSave={() => handleSaveSection('company-body', ['body'])}
                    >
                      <RichTextEditor 
                        key={`editor-${contentKey}`}
                        content={content.body || '<p>Start typing the company profile...</p>'}
                        onChange={(html) => updateField('body', html)}
                      />
                    </CMSSection>
                  </>
                )}

                {/* Contact Us Fields */}
                {activePage === 'contact-us' && (
                  <>
                    <CMSSection 
                      id="contact-header" 
                      title="Page Header" 
                      description="Banner image for the contact page."
                      dirty={isSectionDirty(['header_image'])}
                      saving={activeSectionSaving === 'contact-header'}
                      onSave={() => handleSaveSection('contact-header', ['header_image'])}
                    >
                      <ImageUpload 
                        url={content.header_image || ''} 
                        onUpload={(url) => updateField('header_image', url)} 
                        folder="contact"
                      />
                    </CMSSection>

                    <CMSSection 
                      id="office-locations" 
                      title="Office Locations" 
                      description="Manage up to 3 office or factory locations."
                      dirty={isSectionDirty(['contacts'])}
                      saving={activeSectionSaving === 'office-locations'}
                      onSave={() => handleSaveSection('office-locations', ['contacts'])}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-industrial-700">Location List</h4>
                        {(!content.contacts || content.contacts.length < 3) && (
                          <button 
                            onClick={addContact}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                          >
                            + Add Location
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-6">
                        {(content.contacts || []).map((contact: any, index: number) => (
                          <div key={index} className="p-4 bg-industrial-50 border border-industrial-200 rounded-lg relative">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-medium text-industrial-900">Location {index + 1}</h4>
                              <button 
                                onClick={() => removeContact(index)}
                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-industrial-700 mb-1">Office Title</label>
                                <input 
                                  type="text" 
                                  value={contact.title || ''} 
                                  onChange={(e) => updateContactField(index, 'title', e.target.value)}
                                  className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm"
                                  placeholder="e.g. Corporate Office"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-semibold text-industrial-700 mb-1">Address</label>
                                <textarea 
                                  value={contact.address || ''} 
                                  onChange={(e) => updateContactField(index, 'address', e.target.value)}
                                  className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm"
                                  rows={2}
                                  placeholder="Office address..."
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-industrial-700 mb-1">Phone Numbers (One per line)</label>
                                <textarea 
                                  value={contact.phone || ''} 
                                  onChange={(e) => updateContactField(index, 'phone', e.target.value)}
                                  className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm"
                                  rows={2}
                                  placeholder="+91 12345 67890&#10;+91 09876 54321"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-industrial-700 mb-1">Emails (One per line)</label>
                                <textarea 
                                  value={contact.email || ''} 
                                  onChange={(e) => updateContactField(index, 'email', e.target.value)}
                                  className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm"
                                  rows={2}
                                  placeholder="info@example.com&#10;sales@example.com"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CMSSection>

                    <CMSSection 
                      id="inquiry-options" 
                      title="Product Inquiry Options" 
                      description="Manage the dropdown options for the contact form."
                      dirty={isSectionDirty(['inquiry_options'])}
                      saving={activeSectionSaving === 'inquiry-options'}
                      onSave={() => handleSaveSection('inquiry-options', ['inquiry_options'])}
                    >
                      <div>
                        <label className="block text-xs font-semibold text-industrial-700 mb-1">Options (One per line)</label>
                        <textarea 
                          value={content.inquiry_options || ''} 
                          onChange={(e) => updateField('inquiry_options', e.target.value)}
                          className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm"
                          rows={6}
                          placeholder="e.g. Pulverisers..."
                        />
                      </div>
                    </CMSSection>
                  </>
                )}

                {/* Clients Page Fields */}
                {activePage === 'clients' && (
                   <>
                    <CMSSection 
                      id="clients-hero" 
                      title="Hero Section" 
                      description="Main headline and introductory text for the clients page."
                      dirty={isSectionDirty(['hero_title', 'hero_subtitle', 'hero_image'])}
                      saving={activeSectionSaving === 'clients-hero'}
                      onSave={() => handleSaveSection('clients-hero', ['hero_title', 'hero_subtitle', 'hero_image'])}
                    >
                      <div>
                        <label className="block text-sm font-semibold text-industrial-900 mb-2">Hero Headline</label>
                        <input type="text" value={content.hero_title || ''} onChange={(e) => updateField('hero_title', e.target.value)} className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500" placeholder="Trusted by 1500+ Industry Leaders" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-industrial-900 mb-2">Hero Subtitle</label>
                        <textarea value={content.hero_subtitle || ''} onChange={(e) => updateField('hero_subtitle', e.target.value)} className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500" rows={3} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-industrial-900 mb-2">Hero Background Image</label>
                        <ImageUpload url={content.hero_image || ''} onUpload={(url) => updateField('hero_image', url)} folder="clients" />
                      </div>
                    </CMSSection>

                    <CMSSection 
                      id="clients-stats" 
                      title="Success Metrics" 
                      description="Counter bar showing the scale of operations (Max 6)."
                      dirty={isSectionDirty(['stats'])}
                      saving={activeSectionSaving === 'clients-stats'}
                      onSave={() => handleSaveSection('clients-stats', ['stats'])}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-industrial-700">Counter List</h4>
                        <button onClick={addStat} className="text-primary-600 hover:text-primary-700 text-sm font-medium">+ Add Stat</button>
                      </div>
                      {content.stats && content.stats.length > 0 ? (
                        <div className="space-y-3">
                          {content.stats.map((stat: any, index: number) => (
                            <div key={index} className="p-3 bg-industrial-50 border border-industrial-200 rounded-lg flex items-center gap-3">
                              <div className="flex-1">
                                <label className="block text-xs font-semibold text-industrial-700 mb-1">Number</label>
                                <input type="text" value={stat.number || ''} onChange={(e) => updateStat(index, 'number', e.target.value)} className="w-full px-3 py-1.5 border border-industrial-300 rounded-md text-sm" placeholder="e.g. 700+" />
                              </div>
                              <div className="flex-[2]">
                                <label className="block text-xs font-semibold text-industrial-700 mb-1">Label</label>
                                <input type="text" value={stat.label || ''} onChange={(e) => updateStat(index, 'label', e.target.value)} className="w-full px-3 py-1.5 border border-industrial-300 rounded-md text-sm" placeholder="e.g. Bagging Machines Deployed" />
                              </div>
                              <button onClick={() => removeStat(index)} className="text-red-500 hover:text-red-700 text-sm font-medium mt-5">✕</button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-industrial-500">No stats added. Click "+ Add Stat".</p>
                      )}
                    </CMSSection>

                    <CMSSection 
                      id="featured-clients" 
                      title="Featured Logos" 
                      description="Logo grid showing prominent client partnerships."
                      dirty={isSectionDirty(['featured_clients'])}
                      saving={activeSectionSaving === 'featured-clients'}
                      onSave={() => handleSaveSection('featured-clients', ['featured_clients'])}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-industrial-700">Logo Grid</h4>
                        <button onClick={addFeaturedClient} className="text-primary-600 hover:text-primary-700 text-sm font-medium">+ Add Client</button>
                      </div>
                      {content.featured_clients && content.featured_clients.length > 0 ? (
                        <div className="space-y-4">
                          {content.featured_clients.map((client: any, index: number) => (
                            <div key={index} className="p-4 bg-industrial-50 border border-industrial-200 rounded-lg">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium text-industrial-900">Client {index + 1}</h4>
                                <button onClick={() => removeFeaturedClient(index)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="md:col-span-2">
                                  <label className="block text-xs font-semibold text-industrial-700 mb-1">Logo Image</label>
                                  <ImageUpload url={client.image_url || ''} onUpload={(url) => updateFeaturedClient(index, 'image_url', url)} folder="clients/logos" />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-industrial-700 mb-1">Client Name</label>
                                  <input type="text" value={client.name || ''} onChange={(e) => updateFeaturedClient(index, 'name', e.target.value)} className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm" placeholder="e.g. Tata Steel" />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-industrial-700 mb-1">Website URL (Optional)</label>
                                  <input type="url" value={client.website_url || ''} onChange={(e) => updateFeaturedClient(index, 'website_url', e.target.value)} className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm" placeholder="https://..." />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-industrial-500">No featured clients. Click "+ Add Client" to add logo cards.</p>
                      )}
                    </CMSSection>

                    <CMSSection 
                      id="state-presence" 
                      title="Geographic Presence" 
                      description="Toggle states on the India map where Tyco has an active presence."
                      dirty={isSectionDirty(['state_presence'])}
                      saving={activeSectionSaving === 'state-presence'}
                      onSave={() => handleSaveSection('state-presence', ['state_presence'])}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {[
                          { id: 'jk', name: 'J&K' }, { id: 'hp', name: 'Himachal' }, { id: 'pb', name: 'Punjab' },
                          { id: 'uk', name: 'Uttarakhand' }, { id: 'hr', name: 'Haryana' }, { id: 'dl', name: 'Delhi' },
                          { id: 'rj', name: 'Rajasthan' }, { id: 'up', name: 'U.P.' }, { id: 'br', name: 'Bihar' },
                          { id: 'wb', name: 'W. Bengal' }, { id: 'jh', name: 'Jharkhand' }, { id: 'or', name: 'Odisha' },
                          { id: 'gj', name: 'Gujarat' }, { id: 'mp', name: 'M.P.' }, { id: 'mh', name: 'Maharashtra' },
                          { id: 'cg', name: 'Chhattisgarh' }, { id: 'ga', name: 'Goa' }, { id: 'ka', name: 'Karnataka' },
                          { id: 'ap', name: 'A.P.' }, { id: 'ts', name: 'Telangana' }, { id: 'tn', name: 'Tamil Nadu' },
                          { id: 'kl', name: 'Kerala' }, { id: 'ne', name: 'North East' }, { id: 'as', name: 'Assam' },
                        ].map((state) => (
                          <label key={state.id} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                            content.state_presence?.[state.id] ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-industrial-200 text-industrial-600'
                          }`}>
                            <input
                              type="checkbox"
                              checked={!!content.state_presence?.[state.id]}
                              onChange={() => toggleStatePresence(state.id)}
                              className="rounded text-primary-600 focus:ring-primary-500"
                            />
                            {state.name}
                          </label>
                        ))}
                      </div>
                    </CMSSection>

                    <CMSSection 
                      id="client-categories" 
                      title="Client Categories" 
                      description="Organize clients by industry sector (Accordion format)."
                      dirty={isSectionDirty(['categories'])}
                      saving={activeSectionSaving === 'client-categories'}
                      onSave={() => handleSaveSection('client-categories', ['categories'])}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-industrial-700">Category List</h4>
                        <button onClick={addCategory} className="text-primary-600 hover:text-primary-700 text-sm font-medium">+ Add Category</button>
                      </div>
                      {content.categories && content.categories.length > 0 ? (
                        <div className="space-y-4">
                          {content.categories.map((cat: any, index: number) => (
                            <div key={index} className="p-4 bg-industrial-50 border border-industrial-200 rounded-lg">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-medium text-industrial-900">Category {index + 1}</h4>
                                <button onClick={() => removeCategory(index)} className="text-red-500 hover:text-red-700 text-sm font-medium">Remove</button>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-semibold text-industrial-700 mb-1">Category Name</label>
                                  <input type="text" value={cat.name || ''} onChange={(e) => updateCategory(index, 'name', e.target.value)} className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm" placeholder="e.g. Steel, Iron & Metals" />
                                </div>
                                <div>
                                  <label className="block text-xs font-semibold text-industrial-700 mb-1">Client Names (one per line)</label>
                                  <textarea value={cat.clients || ''} onChange={(e) => updateCategory(index, 'clients', e.target.value)} className="w-full px-3 py-2 border border-industrial-300 rounded-md text-sm font-mono" rows={6} placeholder={"Tata Sponge Iron Ltd.\nJindal Steel & Power Ltd.\nEssar Steel"} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-industrial-500">No categories. Click "+ Add Category" to organize clients by industry.</p>
                      )}
                    </CMSSection>
                  </>
                )}

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
