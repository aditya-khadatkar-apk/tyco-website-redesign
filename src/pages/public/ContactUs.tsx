import { Helmet } from 'react-helmet-async';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactUs() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    // Simulate API call to Supabase Edge Function
    setTimeout(() => {
      setStatus('success');
    }, 1500);
  };

  return (
    <div className="bg-industrial-100 min-h-screen pb-20">
      <Helmet>
        <title>Contact Us | Tyco India</title>
        <meta name="description" content="Get in touch with Tyco India for industrial equipment inquiries." />
      </Helmet>

      {/* Header */}
      <div className="bg-industrial-900 py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
          
          {/* Contact Info */}
          <div className="md:w-1/3 bg-industrial-800 text-white p-8 md:p-12 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-semibold mb-8 font-heading">Get In Touch</h2>
              <ul className="space-y-6">
                <li className="flex items-start">
                  <MapPin className="h-6 w-6 text-primary-500 mr-4 mt-1 flex-shrink-0" />
                  <span className="text-industrial-300">Nagpur Factory, Maharashtra, India</span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-6 w-6 text-primary-500 mr-4 flex-shrink-0" />
                  <span className="text-industrial-300">+91 XXXXX XXXXX</span>
                </li>
                <li className="flex items-center">
                  <Mail className="h-6 w-6 text-primary-500 mr-4 flex-shrink-0" />
                  <span className="text-industrial-300">info@tyco-india.com</span>
                </li>
              </ul>
            </div>
            <div className="mt-12">
              <p className="text-sm text-industrial-400">
                Operating Hours:<br/>
                Mon - Sat: 9:00 AM - 6:00 PM
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:w-2/3 p-8 md:p-12">
            <h2 className="text-2xl font-semibold mb-6 text-industrial-900 font-heading">Send us a Message</h2>
            
            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Send className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                <p>Thank you for reaching out. Our team will get back to you shortly.</p>
                <button 
                  onClick={() => setStatus('idle')}
                  className="mt-6 text-primary-600 font-medium hover:text-primary-700 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-industrial-700 mb-1">Full Name</label>
                    <input required type="text" id="name" className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="John Doe" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-industrial-700 mb-1">Email Address</label>
                    <input required type="email" id="email" className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="john@example.com" />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-industrial-700 mb-1">Subject</label>
                  <input required type="text" id="subject" className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="Product Inquiry" />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-industrial-700 mb-1">Message</label>
                  <textarea required id="message" rows={5} className="w-full px-4 py-2 border border-industrial-300 rounded-md focus:ring-primary-500 focus:border-primary-500 outline-none resize-none" placeholder="How can we help you?"></textarea>
                </div>
                
                <button 
                  type="submit" 
                  disabled={status === 'submitting'}
                  className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-500 transition-colors font-semibold flex items-center justify-center disabled:opacity-70"
                >
                  {status === 'submitting' ? 'Sending...' : (
                    <>Send Message <Send className="ml-2 h-4 w-4" /></>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
