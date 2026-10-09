import { motion } from 'motion/react';
import { ShieldCheck, Award, HeartHandshake, Sparkles } from 'lucide-react';

export default function Banner() {
  // Stagger variants for list
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      }
    }
  };

  const itemLeftVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  };

  const itemRightVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  };

  const floatAnimation = {
    y: [0, -12, 0],
    rotate: [0, 1.5, -1.5, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };

  return (
    <div className="relative overflow-hidden bg-transparent text-white">
      {/* Decorative ambient gold radial gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-gold/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-gold-dark/5 blur-[150px] pointer-events-none" />

      {/* Hero Core */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text: Animated from Left to Right */}
          <motion.div 
            initial={{ opacity: 0, x: -70 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left"
            id="hero-text-container"
          >
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gold/10 border border-gold/30 rounded-full text-[10px] sm:text-xs text-gold tracking-widest font-semibold uppercase">
              <Sparkles size={12} className="animate-pulse" />
              Heirloom Treasures
            </div>
            
            <h1 className="font-serif text-2xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-snug sm:leading-tight">
              Crafted in <span className="bg-gradient-to-r from-gold-light via-gold to-gold-bright bg-clip-text text-transparent">Pure gold</span>,
              <br />
              Worn with <span className="italic">Pride</span>.
            </h1>
            
            <p className="font-sans text-gray-300 text-xs sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              For over three decades, Aurum has been creating royal masterpieces that transcend generations. 
              Every diamond is conflict-free, every ounce of gold is ethical, and every design is a unique story waiting to be told.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => {
                  const elem = document.getElementById('jewelry-items');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-gold-dark via-gold to-gold-bright hover:from-gold-bright hover:via-gold hover:to-gold-dark text-dark-rich font-semibold tracking-widest uppercase text-[10px] sm:text-xs px-6 py-3.5 sm:px-8 sm:py-4 rounded-full transition-all duration-300 shadow-lg shadow-gold/25 hover:shadow-gold/40 transform hover:-translate-y-0.5 active:translate-y-0"
                id="cta-explore"
              >
                Explore Collections
              </button>
              
              <button
                onClick={() => {
                  const elem = document.getElementById('about-company-section');
                  if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-transparent border border-gold/40 hover:border-gold hover:bg-gold/5 text-gold-light font-medium tracking-wider text-[10px] sm:text-xs px-6 py-3.5 sm:px-8 sm:py-4 rounded-full transition-all"
                id="cta-story"
              >
                Our Legacy
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gold/15 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <p className="font-serif text-lg sm:text-2xl font-bold text-gold">100%</p>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-gray-400">Ethical Gold</p>
              </div>
              <div className="text-center lg:text-left border-x border-gold/10">
                <p className="font-serif text-lg sm:text-2xl font-bold text-gold">30k+</p>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-gray-400">Happy Clients</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="font-serif text-lg sm:text-2xl font-bold text-gold">30+</p>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-wider text-gray-400">Years Legacy</p>
              </div>
            </div>
          </motion.div>

          {/* Right Visual Asset: Floating and Rotating */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: 70 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="lg:col-span-5 flex justify-center"
            id="hero-image-container"
          >
            <div className="relative">
              {/* Luxury circular gold rotating background accent */}
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/20 via-transparent to-gold-dark/20 rounded-full animate-spin [animation-duration:30s] blur-md pointer-events-none" />
              
              <motion.div 
                animate={floatAnimation}
                className="relative z-10 p-4"
              >
                <img 
                  src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop" 
                  alt="Aurum Premium Gold Solitaire Ring" 
                  className="w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] object-cover rounded-[2.5rem] border-2 border-gold/50 shadow-2xl gold-glow"
                  referrerPolicy="no-referrer"
                  id="hero-banner-image"
                />
                
                {/* Micro-floating badges on image */}
                <div className="absolute -top-2 -right-2 glass rounded-2xl px-3 py-1.5 shadow-lg flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-mono text-gold-light tracking-wide uppercase font-semibold">BIS 916 Hallmarked</span>
                </div>

                <div className="absolute bottom-6 -left-4 glass rounded-2xl p-2.5 shadow-lg flex items-center gap-2">
                  <Award size={20} className="text-gold" />
                  <div>
                    <p className="text-[10px] font-sans text-white font-semibold">Masterpieces</p>
                    <p className="text-[8px] font-mono text-gold/80 uppercase">Handmade in Italy</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* About Company Segment: Alternating Flow Sections */}
      <div className="border-t border-white/10 bg-transparent" id="about-company-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-serif text-xl sm:text-4xl font-bold text-gold bg-gradient-to-r from-gold-light via-gold to-gold bg-clip-text text-transparent">
              The Aurum Legacy
            </h2>
            <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-2" />
            <p className="text-xs sm:text-sm text-gray-400 mt-4 leading-relaxed font-sans">
              Discover the core philosophy and generational values that define our fine jewelry crafting.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12"
            id="about-company-grid"
          >
            {/* Value 1: Flow left-to-right */}
            <motion.div 
              variants={itemLeftVariants}
              className="glass p-8 rounded-2xl text-center flex flex-col items-center gold-glow-hover"
              id="about-card-1"
            >
              <div className="p-4 bg-gold/10 rounded-full border border-gold/20 mb-5 text-gold">
                <Award size={28} />
              </div>
              <h3 className="font-serif text-lg font-bold text-gold-light mb-2">Unmatched Craftsmanship</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans font-light">
                Every single ornament is forged by hand by master jewelers with decades of experience, passing down secrets of fine carvings and delicate stone mountings.
              </p>
            </motion.div>

            {/* Value 2: Flow center up */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
              }}
              className="glass p-8 rounded-2xl text-center flex flex-col items-center gold-glow-hover"
              id="about-card-2"
            >
              <div className="p-4 bg-gold/10 rounded-full border border-gold/20 mb-5 text-gold">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-serif text-lg font-bold text-gold-light mb-2">100% Ethical Sourcing</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans font-light">
                We guarantee that our gold is ethically extracted and our diamonds are certified conflict-free following international Kimberley process standards.
              </p>
            </motion.div>

            {/* Value 3: Flow right-to-left */}
            <motion.div 
              variants={itemRightVariants}
              className="glass p-8 rounded-2xl text-center flex flex-col items-center gold-glow-hover"
              id="about-card-3"
            >
              <div className="p-4 bg-gold/10 rounded-full border border-gold/20 mb-5 text-gold">
                <HeartHandshake size={28} />
              </div>
              <h3 className="font-serif text-lg font-bold text-gold-light mb-2">Lifetime Authenticity</h3>
              <p className="text-xs text-gray-300 leading-relaxed font-sans font-light">
                Our items come with official certificate seals (including BIS Hallmarked 916 and GIA certifications) and a lifetime buyback or restoration guarantee.
              </p>
            </motion.div>

          </motion.div>

        </div>
      </div>
    </div>
  );
}
