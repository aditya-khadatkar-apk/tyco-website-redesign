import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Send, Loader2, ChevronDown } from 'lucide-react';
import { useCMS } from '../../hooks/useCMS';
import { useState } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export default function ContactUs() {
  const { content, loading: cmsLoading } = useCMS('contact-us');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/contact-form`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send message');
      }

      setStatus('success');
    } catch (err: any) {
      console.error('Contact form error:', err);
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  return (
    <div className="bg-industrial-100 min-h-screen pb-20">
      <Helmet>
        <title>Contact Us | Tyco India</title>
        <meta name="description" content="Get in touch with Tyco India for industrial equipment inquiries." />
      </Helmet>

      {/* Header */}
      <div className="relative bg-industrial-900 py-16 mb-12 overflow-hidden">
        {content.header_image && (
          <div className="absolute inset-0 z-0">
            <img src={content.header_image} alt="Header Background" className="w-full h-full object-cover mix-blend-overlay opacity-40" />
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
            Contact <span className="text-primary-500">Us</span>
          </h1>
          <p className="text-industrial-300 text-lg max-w-2xl mx-auto">
            Have a project in mind? Reach out to our team for custom industrial solutions and inquiries.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg border border-industrial-200 overflow-hidden flex flex-col md:flex-row">

          {/* Contact Info Sidebar */}
          <div className="md:w-1/3 bg-industrial-900 text-white p-8 md:p-10 flex flex-col justify-between border-r border-industrial-800">
            <div>
              <h2 className="text-2xl font-bold mb-10 font-heading text-white border-b-2 border-primary-500 pb-2 inline-block">
                Our Offices
              </h2>
              
              <div className="space-y-12">
                {content.contacts && content.contacts.length > 0 ? (
                  content.contacts.map((contact: any, index: number) => (
                    <div key={index} className="group animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                      {contact.title && (
                        <h3 className="text-primary-500 font-bold uppercase tracking-wider text-xs mb-4 flex items-center">
                          <span className="w-8 h-px bg-primary-500/30 mr-3"></span>
                          {contact.title}
                        </h3>
                      )}
                      
                      <div className="space-y-5 pl-2">
                        {/* Address */}
                        <div className="flex items-start gap-4">
                          <div className="mt-1 p-1.5 rounded-md bg-industrial-800 text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <p className="text-industrial-300 text-sm leading-relaxed">
                            {cmsLoading ? 'Loading address...' : contact.address}
                          </p>
                        </div>

                        {/* Phone Numbers */}
                        {contact.phone && (
                          <div className="flex items-start gap-4">
                            <div className="mt-1 p-1.5 rounded-md bg-industrial-800 text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                              <Phone className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col gap-1">
                              {contact.phone.split(/[\n,]/).filter(Boolean).map((p: string, i: number) => (
                                <a key={i} href={`tel:${p.replace(/\s/g, '')}`} className="text-industrial-300 text-sm hover:text-white transition-colors">
                                  {p.trim()}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Emails */}
                        {contact.email && (
                          <div className="flex items-start gap-4">
                            <div className="mt-1 p-1.5 rounded-md bg-industrial-800 text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-colors">
                              <Mail className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col gap-1">
                              {contact.email.split(/[\n,]/).filter(Boolean).map((e: string, i: number) => (
                                <a key={i} href={`mailto:${e.trim()}`} className="text-industrial-300 text-sm hover:text-white transition-colors break-all">
                                  {e.trim()}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-industrial-400 italic text-sm">No office locations configured.</p>
                )}
              </div>
            </div>

            <div className="mt-16 pt-8 border-t border-industrial-800">
              <div className="flex items-center gap-3 text-industrial-400 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                <span className="text-xs font-bold uppercase tracking-widest">Availability</span>
              </div>
              <p className="text-sm text-industrial-300 leading-relaxed">
                Mon - Sun: 8:00 AM - 5:00 PM<br/>
                <span className="text-primary-500/80">(Closed on Wednesdays)</span>
              </p>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="md:w-2/3 p-8 md:p-12 bg-white flex flex-col justify-center">
            <div className="max-w-2xl mx-auto w-full">
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-industrial-900 font-heading mb-2">
                  Send us a <span className="text-primary-600">Message</span>
                </h2>
                <p className="text-industrial-500 text-sm">
                  Fill out the form below and our industrial specialists will get back to you within 24 hours.
                </p>
              </div>
              
              {status === 'success' ? (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <Send className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                  <p className="max-w-md">Thank you for reaching out to Tyco India. We have received your inquiry and will contact you shortly.</p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="mt-8 px-6 py-2 bg-white border border-green-200 rounded-lg text-green-700 font-semibold hover:bg-green-100 transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {status === 'error' && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                      {errorMsg || 'Something went wrong. Please try again.'}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-industrial-500 flex items-center gap-2">
                        Full Name
                      </label>
                      <input 
                        required 
                        type="text" 
                        id="name" 
                        name="name" 
                        className="w-full px-4 py-3 bg-industrial-50 border border-industrial-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-industrial-400 text-sm" 
                        placeholder="e.g. Rahul Sharma" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-industrial-500 flex items-center gap-2">
                        Email Address
                      </label>
                      <input 
                        required 
                        type="email" 
                        id="email" 
                        name="email" 
                        className="w-full px-4 py-3 bg-industrial-50 border border-industrial-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-industrial-400 text-sm" 
                        placeholder="rahul@company.com" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="text-xs font-bold uppercase tracking-wider text-industrial-500 flex items-center gap-2">
                      Product Inquiry
                    </label>
                    <div className="relative group">
                      <select 
                        required 
                        id="subject" 
                        name="subject" 
                        defaultValue=""
                        className="w-full px-4 py-3 bg-industrial-50 border border-industrial-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none appearance-none text-industrial-900 transition-all cursor-pointer text-sm"
                      >
                        <option value="" disabled>Select a product or service</option>
                        {(content.inquiry_options || 'General Inquiry\nPulverisers\nClassifiers\nMaterial Handling\nAfter Sales Support')
                          .split('\n')
                          .filter(Boolean)
                          .map((option: string, i: number) => (
                            <option key={i} value={option.trim()}>{option.trim()}</option>
                          ))
                        }
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-industrial-400 group-focus-within:text-primary-500 transition-colors">
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-industrial-500 flex items-center gap-2">
                      Message / Requirements
                    </label>
                    <textarea 
                      required 
                      id="message" 
                      name="message" 
                      rows={4} 
                      className="w-full px-4 py-3 bg-industrial-50 border border-industrial-200 rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none transition-all placeholder:text-industrial-400 text-sm" 
                      placeholder="Tell us about your specific industrial requirements..."
                    ></textarea>
                  </div>
                  
                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={status === 'submitting'}
                      className="group relative w-full md:w-auto px-10 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all font-bold shadow-lg shadow-primary-600/20 flex items-center justify-center disabled:opacity-70 overflow-hidden"
                    >
                      <div className="relative z-10 flex items-center">
                        {status === 'submitting' ? (
                          <><Loader2 className="animate-spin mr-2 h-5 w-5" /> Processing...</>
                        ) : (
                          <>Send Inquiry <Send className="ml-3 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
