import { Helmet } from 'react-helmet-async';

export default function CompanyProfile() {
  return (
    <div className="bg-white pb-20">
      <Helmet>
        <title>Company Profile | Tyco India Private Limited</title>
        <meta name="description" content="Learn about Tyco India, manufacturing a large range of Industrial Equipment since 1977." />
      </Helmet>

      {/* Page Header */}
      <div className="bg-industrial-900 py-16 mb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4">
            Company <span className="text-primary-500">Profile</span>
          </h1>
          <p className="text-industrial-300 text-lg">A Legacy of Quality and Reliability since 1977</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="prose prose-industrial prose-lg max-w-none text-industrial-700 leading-relaxed">
          <p className="text-xl font-medium text-industrial-900 mb-6">
            TYCO was incorporated on 15th of September, 1977. The Company manufactures a large range of Industrial Equipment at its Nagpur factory. All products of the Company are well accepted in the Indian Market for their quality and reliability. During its nearly 38+ years of existence the Company has successfully carved a niche for itself among quality conscious users in India and abroad and has over 1500 satisfied customers through-out India.
          </p>

          <p className="mb-6">
            Tyco pioneered the concept of automatic weighing in India with technical support from a German company establishing a second factory in Nagpur. Tyco has supplied automatic weighing systems in India and abroad for applications ranging from lumpy and granular to fine powders upto a fineness of 10 microns. The end users who use our systems are Sugar, Chemicals, Polyester Chips, Refractory Manufacturers, and Mineral Processors, Fertilizers, Spices, Cattle Feed, Deoiled Cakes, Sponge Iron, Rice Exporters, Flour, Pigment, Calcined Bauxite, Titanium Dioxide etc.
          </p>

          <p className="mb-6">
            The factory at Nagpur also has extensive manufacturing facilities for Minerals Processing Equipment.
          </p>

          <h3 className="text-2xl font-semibold text-industrial-900 mt-8 mb-4 font-heading">Our Product Range</h3>
          <p className="mb-6">
            Tyco Product range includes, Automatic Weighing, Bagging Systems from 1Kg to 1 ton, Pulverizers, Centrifugal type Air Classifiers, Double toggle type Jaw & Stone Crushers, Process line & Packing Line Conveyors, Truck Loader, Stacker, Screw Conveyors, and Bucket Elevators.
          </p>

          <p className="font-semibold text-primary-600 mb-8 text-lg bg-industrial-50 p-4 border border-industrial-200 rounded-lg shadow-sm">
            Over 700 Bagging Machines, 950 Pulverisers, 60 Centrifugal Classifiers, and 500 Vibrators are working in the field.
          </p>

          <h3 className="text-2xl font-semibold text-industrial-900 mt-8 mb-4 font-heading">Our Valued Customers</h3>
          <p className="mb-6">
            TYCO customers include ITC, Hindustan Lever, Tata Chemicals, TISCO, Tata Sponge, Rourkela Steel Plant, Durgapur Steel Plant, Bokaro Steel Plant, EID Parry, Dabur Industries, Indian Aluminium Co, ESSAR Gujarat, Jindal Steel, amongst a large number of other users. TYCO equipment are in use in these markets for over a decade and enjoy favored status.
          </p>

          <p className="mb-6">
            In 2000 the manufacturing operations were consolidated in Nagpur.
          </p>

          <blockquote className="border-l-4 border-primary-500 pl-6 py-2 my-8 bg-industrial-50 italic text-industrial-800 text-xl font-medium rounded-r-lg">
            "Tyco products are designed, manufactured, and supplied, as per ISO 9001 standards"
          </blockquote>

          <p className="mb-6">
            Tyco undertakes supply of weighing systems along with turnkey supply of material handling in various combinations to suit customer requirements including Storage Silos, Bucket Elevators, Conveyors, Lorry Loaders, and Stitching Machine etc.
          </p>

          <p className="mb-6">
            Tyco belongs to a professionally owned and run group of companies with the vision to give world-class technologies and products to its customers. We have state of the art systems and infrastructure to provide excellent after market services. Has emerged as People Oriented, Growing Company with strong customer orientation.
          </p>

          <p className="mb-6">
            Tyco is in discussion with a few companies to bring newer and better technologies and products to the Indian market providing better value proposition.
          </p>
        </div>
      </div>
    </div>
  );
}
