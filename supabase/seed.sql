-- Seed script to populate the CMS pages with the original hardcoded Tyco India content

INSERT INTO public.pages (slug, content)
VALUES
  (
    'home',
    '{
      "hero_title": "Precision Industrial Equipment for Modern Manufacturing.",
      "hero_subtitle": "Since 1977, Tyco India has engineered reliable pulverisers, classifiers, and material handling systems for over 1500 satisfied clients worldwide.",
      "hero_image": ""
    }'::jsonb
  ),
  (
    'contact-us',
    '{
      "header_image": "",
      "address": "Nagpur Factory, Maharashtra, India",
      "phone": "+91 XXXXX XXXXX",
      "email": "info@tyco-india.com"
    }'::jsonb
  ),
  (
    'company-profile',
    '{
      "header_image": "",
      "body": "<p>TYCO was incorporated on 15th of September, 1977. The Company manufactures a large range of Industrial Equipment at its Nagpur factory. All products of the Company are well accepted in the Indian Market for their quality and reliability. During its nearly 38+ years of existence the Company has successfully carved a niche for itself among quality conscious users in India and abroad and has over 1500 satisfied customers through-out India.</p><p>Tyco pioneered the concept of automatic weighing in India with technical support from a German company establishing a second factory in Nagpur. Tyco has supplied automatic weighing systems in India and abroad for applications ranging from lumpy and granular to fine powders upto a fineness of 10 microns. The end users who use our systems are Sugar, Chemicals, Polyester Chips, Refractory Manufacturers, and Mineral Processors, Fertilizers, Spices, Cattle Feed, Deoiled Cakes, Sponge Iron, Rice Exporters, Flour, Pigment, Calcined Bauxite, Titanium Dioxide etc.</p><p>The factory at Nagpur also has extensive manufacturing facilities for Minerals Processing Equipment.</p><h2>Our Product Range</h2><p>Tyco Product range includes, Automatic Weighing, Bagging Systems from 1Kg to 1 ton, Pulverizers, Centrifugal type Air Classifiers, Double toggle type Jaw & Stone Crushers, Process line & Packing Line Conveyors, Truck Loader, Stacker, Screw Conveyors, and Bucket Elevators.</p><p><strong>Over 700 Bagging Machines, 950 Pulverisers, 60 Centrifugal Classifiers, and 500 Vibrators are working in the field.</strong></p><h2>Our Valued Customers</h2><p>TYCO customers include ITC, Hindustan Lever, Tata Chemicals, TISCO, Tata Sponge, Rourkela Steel Plant, Durgapur Steel Plant, Bokaro Steel Plant, EID Parry, Dabur Industries, Indian Aluminium Co, ESSAR Gujarat, Jindal Steel, amongst a large number of other users. TYCO equipment are in use in these markets for over a decade and enjoy favored status.</p><p>In 2000 the manufacturing operations were consolidated in Nagpur.</p><blockquote>\"Tyco products are designed, manufactured, and supplied, as per ISO 9001 standards\"</blockquote><p>Tyco undertakes supply of weighing systems along with turnkey supply of material handling in various combinations to suit customer requirements including Storage Silos, Bucket Elevators, Conveyors, Lorry Loaders, and Stitching Machine etc.</p><p>Tyco belongs to a professionally owned and run group of companies with the vision to give world-class technologies and products to its customers. We have state of the art systems and infrastructure to provide excellent after market services. Has emerged as People Oriented, Growing Company with strong customer orientation.</p><p>Tyco is in discussion with a few companies to bring newer and better technologies and products to the Indian market providing better value proposition.</p>"
    }'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET content = EXCLUDED.content;
