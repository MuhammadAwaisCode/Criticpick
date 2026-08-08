import TopNav from '../../src/components/TopNav';
import SubNav from '../../src/components/SubNav';
import Footer from '../../src/components/Footer';

export const metadata = {
  title: 'About Us',
  description:
    'Discover Critipick — a review-driven marketplace built around curated authenticity, verified reviews, and top-tier merchandise.',
};

// ---------------------------------------------------------------------------
// Static content — mirrors the "Why Shoppers Prefer Criticpick" grid from
// the legacy Aboutus.html. Pulled into data so the markup below stays clean.
// ---------------------------------------------------------------------------
const VALUE_PROPS = [
  {
    icon: 'fa-shield-alt',
    iconColor: 'text-purple-600',
    title: '100% Secure Purchases',
    description: 'Fully safe payment interfaces and structured refund guarantee options.',
  },
  {
    icon: 'fa-certificate',
    iconColor: 'text-pink-600',
    title: 'Strict Quality Audit',
    description: 'Every listing passes strict authenticity verification parameters before publication.',
  },
  {
    icon: 'fa-shipping-fast',
    iconColor: 'text-purple-600',
    title: 'Reliable Logistics',
    description: 'Streamlined delivery timelines across nationwide networks with real-time updates.',
  },
  {
    icon: 'fa-headset',
    iconColor: 'text-pink-600',
    title: '24/7 Customer Support',
    description: 'A dedicated support desk ready to resolve order, payment, or delivery concerns.',
  },
  {
    icon: 'fa-star',
    iconColor: 'text-purple-600',
    title: 'Verified Reviews Only',
    description: 'Ratings and reviews are tied to confirmed purchases — no bots, no manipulation.',
  },
  {
    icon: 'fa-hand-holding-heart',
    iconColor: 'text-pink-600',
    title: 'Fair Seller Ecosystem',
    description: 'Vendors, traders, and affiliates operate under transparent, standardized policies.',
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* NOTE: Navbars aur Footer layout.js se automatic aa rahe hain.
        Aap ke original elements ko bina chede comment kar diya hai 
        taake page par duplicate double items show na hon.
      */}
      {/* <TopNav /> */}
      {/* <SubNav /> */}

      <main className="flex-grow max-w-5xl w-full mx-auto px-4 py-12">
        {/* =================================================================
            HERO
        ================================================================= */}
        <section className="bg-white/85 backdrop-blur rounded-2xl shadow-xl overflow-hidden mb-8 text-center relative p-8 md:p-12 border border-white/40">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400" />
          <h1 className="text-3xl md:text-5xl font-black text-purple-950 mb-4 tracking-tight">
            Discover{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Criticpick
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            We bridge the gap between quality products and critical choices. Criticpick is your
            ultimate premium destination designed to deliver curated authenticity, verified
            reviews, and top-tier merchandise directly to your doorstep.
          </p>
        </section>

        {/* =================================================================
            MISSION / VISION
        ================================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/85 backdrop-blur rounded-2xl shadow-lg p-6 md:p-8 border border-white/40">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 text-xl mb-4 shadow-inner">
              <i className="fas fa-bullseye" />
            </div>
            <h2 className="text-xl font-black text-purple-950 mb-2">Our Mission</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              To simplify e-commerce choice paralysis by offering rigorously selected products
              matched with explicit transparency, verified specifications, and unmatched customer
              care parameters.
            </p>
          </div>

          <div className="bg-white/85 backdrop-blur rounded-2xl shadow-lg p-6 md:p-8 border border-white/40">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600 text-xl mb-4 shadow-inner">
              <i className="fas fa-eye" />
            </div>
            <h2 className="text-xl font-black text-purple-950 mb-2">Our Vision</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              To cultivate a frictionless, trusted global shopping landscape where every pick is
              structurally verified, every delivery secure, and consumer empowerment stands
              absolute.
            </p>
          </div>
        </section>

        {/* =================================================================
            VALUE PROPOSITION GRID
        ================================================================= */}
        <section className="bg-white/85 backdrop-blur rounded-2xl shadow-xl p-6 md:p-8 border border-white/40">
          <h2 className="text-2xl font-black text-purple-950 text-center mb-8">
            Why Shoppers Prefer Criticpick
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUE_PROPS.map((prop) => (
              <div key={prop.title} className="flex items-start gap-4 p-3">
                <div className={`text-lg mt-1 ${prop.iconColor}`}>
                  <i className={`fas ${prop.icon}`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm mb-1">{prop.title}</h3>
                  <p className="text-xs text-gray-500 leading-normal">{prop.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* <Footer /> */}
    </div>
  );
}