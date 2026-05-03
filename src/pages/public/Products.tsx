import { Helmet } from 'react-helmet-async';
import { ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

// Temporary mock data until Phase 2 CRUD is connected
const MOCK_PRODUCTS = [
  { id: '1', name: 'Pulveriser', slug: 'pulveriser', description: 'Combines ruggedness, dependability, high efficiency and automatic operation for grinding and classifying.' },
  { id: '2', name: 'Spices Pulverizer', slug: 'spices-pulverizer', description: '2 stage grinding operations for coarse and fine grinding of spices.' },
  { id: '3', name: 'Automatic Weighing & Bagging Machine', slug: 'automatic-weighing-bagging-machine', description: 'Compact and versatile system for weighing and packing of Fines, Lumps, Granules & Powdery material.' },
  { id: '4', name: 'Air Classifier', slug: 'air-classifier', description: 'Centrifugal type air classifiers for precision particle separation.' },
  { id: '5', name: 'Material Handling Equipments', slug: 'material-handling-equipments', description: 'Conveyors, Elevators, and Loaders for comprehensive material management.' },
  { id: '6', name: 'Jaw Crusher', slug: 'jaw-crusher', description: 'Double toggle type Jaw & Stone Crushers for heavy-duty reduction.' },
  { id: '7', name: 'Electromagnetic Vibrator', slug: 'electromagnetic-vibrator', description: 'Reliable electromagnetic vibrators for controlled material flow.' },
];

export default function Products() {
  return (
    <div className="bg-industrial-100 min-h-screen pb-20">
      <Helmet>
        <title>Our Products | Tyco India</title>
        <meta name="description" content="Explore Tyco India's range of industrial pulverisers, bagging machines, and crushers." />
      </Helmet>

      {/* Header */}
      <div className="bg-industrial-900 py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
            Our <span className="text-primary-500">Products</span>
          </h1>
          <p className="text-industrial-300 text-lg max-w-2xl mx-auto">
            Engineered for durability and precision. Explore our comprehensive catalog of industrial equipment.
          </p>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_PRODUCTS.map((product) => (
            <div key={product.id} className="bg-white border border-industrial-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              {/* Image Placeholder */}
              <div className="aspect-w-16 aspect-h-10 bg-industrial-200 flex items-center justify-center border-b border-industrial-100">
                <Package className="h-16 w-16 text-industrial-400 group-hover:text-primary-500 transition-colors" />
              </div>
              
              <div className="p-6 flex-grow flex flex-col">
                <h2 className="text-xl font-semibold font-heading text-industrial-900 mb-2">
                  {product.name}
                </h2>
                <p className="text-industrial-600 text-sm mb-6 flex-grow">
                  {product.description}
                </p>
                <Link 
                  to={`/products/${product.slug}`} 
                  className="text-primary-600 font-medium hover:text-primary-700 flex items-center group-hover:translate-x-1 transition-transform w-fit"
                >
                  View Details <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
