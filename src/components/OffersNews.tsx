import { useState } from 'react';
import { motion } from 'motion/react';
import { Megaphone, Calendar, Tag, Check, Copy, ArrowRight, Sparkles } from 'lucide-react';
import { NewsOffer } from '../types';

interface OffersNewsProps {
  posts: NewsOffer[];
}

export default function OffersNews({ posts }: OffersNewsProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const offers = posts.filter(p => p.type === 'offer');
  const news = posts.filter(p => p.type === 'news');

  return (
    <section className="py-20 bg-transparent text-white border-t border-b border-white/10 relative overflow-hidden" id="news-offers-section">
      {/* Decorative ambient lights */}
      <div className="absolute right-0 top-1/4 w-[300px] h-[300px] rounded-full bg-gold-bright/5 blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-gold text-[10px] sm:text-xs font-mono tracking-[0.3em] uppercase block mb-1">Exclusive</span>
          <h2 className="font-serif text-xl sm:text-4xl font-extrabold tracking-tight">
            News, <span className="bg-gradient-to-r from-gold-light via-gold to-gold-bright bg-clip-text text-transparent">Offers & Chronicles</span>
          </h2>
          <div className="h-0.5 w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Offers Column: Slide from Left to Right */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 space-y-6"
            id="offers-column"
          >
            <div className="flex items-center gap-2.5 border-b border-gold/20 pb-3">
              <Tag className="text-gold h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
              <h3 className="font-serif text-base sm:text-xl font-bold text-gold-light">Active Privilege Coupons</h3>
            </div>

            {offers.length === 0 ? (
              <p className="text-[11px] sm:text-xs text-gray-400 italic">No active coupons available right now. Check back soon!</p>
            ) : (
              <div className="space-y-4">
                {offers.map((offer) => (
                  <div 
                    key={offer.id} 
                    className="relative glass p-4 sm:p-6 rounded-2xl border-2 border-dashed border-white/20 hover:border-gold/40 transition-all gold-glow-hover flex flex-col justify-between"
                    id={`offer-card-${offer.id}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <span className="inline-block bg-gold/10 text-gold text-[8px] sm:text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full border border-gold/20 mb-2">
                          Exclusive Offer
                        </span>
                        <h4 className="font-serif text-sm sm:text-base font-bold text-white leading-snug">{offer.title}</h4>
                      </div>
                      <Sparkles className="text-gold h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                    </div>

                    <p className="text-[11px] sm:text-xs text-gray-300 font-sans font-light leading-relaxed mb-4">
                      {offer.content}
                    </p>

                    <div className="flex items-center justify-between gap-4 border-t border-gold/10 pt-4 mt-auto">
                      {offer.discountCode ? (
                        <div className="flex items-center gap-2">
                          <span className="bg-white/5 text-gold font-mono text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded border border-white/10 tracking-wider">
                            {offer.discountCode}
                          </span>
                          <button
                            onClick={() => handleCopyCode(offer.discountCode!)}
                            className="p-1.5 sm:p-2 bg-gold/10 hover:bg-gold/20 rounded border border-gold/20 hover:border-gold transition-colors text-gold"
                            title="Copy Code"
                            id={`copy-btn-${offer.id}`}
                          >
                            {copiedCode === offer.discountCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[9px] sm:text-[10px] text-gray-400">Direct instant store discount applied.</span>
                      )}

                      {offer.expiryDate && (
                        <span className="text-[9px] sm:text-[10px] text-gray-400 font-mono flex items-center gap-1">
                          <Calendar size={10} /> Exp: {offer.expiryDate}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* News Column: Slide from Right to Left */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6"
            id="news-column"
          >
            <div className="flex items-center gap-2.5 border-b border-gold/20 pb-3">
              <Megaphone className="text-gold h-4 w-4 sm:h-5 sm:w-5" />
              <h3 className="font-serif text-base sm:text-xl font-bold text-gold-light">Boutique News & Annals</h3>
            </div>

            {news.length === 0 ? (
              <p className="text-[11px] sm:text-xs text-gray-400 italic">No news updates posted currently. Stay tuned for exciting additions!</p>
            ) : (
              <div className="space-y-6">
                {news.map((item) => (
                  <div 
                    key={item.id} 
                    className="glass p-4 sm:p-5 rounded-2xl transition-all flex flex-col md:flex-row gap-5"
                    id={`news-card-${item.id}`}
                  >
                    {item.imageUrl && (
                      <div className="md:w-32 md:h-24 shrink-0 rounded-xl overflow-hidden w-full h-32">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-gray-400 font-mono">
                          <span>Aurum Editorial</span>
                          <span className="flex items-center gap-1"><Calendar size={10} /> {item.date}</span>
                        </div>
                        <h4 className="font-serif text-sm sm:text-base font-bold text-gold-light tracking-wide">{item.title}</h4>
                        <p className="text-[11px] sm:text-xs text-gray-300 font-sans font-light leading-relaxed line-clamp-3">
                          {item.content}
                        </p>
                      </div>

                      <div className="pt-3 flex items-center gap-1.5 text-[11px] sm:text-xs text-gold font-medium hover:text-gold-bright transition-colors cursor-pointer group mt-2 self-start">
                        <span>Read<span className="hidden sm:inline"> full article</span></span>
                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

        </div>

      </div>
    </section>
  );
}
