import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, MessageCircleHeart } from "lucide-react";
import { COZY_MASCOT_QUOTES } from "../data";

interface MascotBubbleProps {
  customMessage?: string;
  onBubbleClick?: () => void;
}

export default function MascotBubble({ customMessage, onBubbleClick }: MascotBubbleProps) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);

  // Rotate quotes every 9 seconds if no custom message is active
  useEffect(() => {
    if (customMessage) return;
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % COZY_MASCOT_QUOTES.length);
      triggerWiggle();
    }, 9000);
    return () => clearInterval(interval);
  }, [customMessage]);

  const triggerWiggle = () => {
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 800);
  };

  const activeText = customMessage || COZY_MASCOT_QUOTES[quoteIndex];

  return (
    <div 
      id="mascot-section"
      className="flex items-start gap-4 p-4 md:p-6 bg-cozy-cream/70 border border-cozy-sand/50 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-xs relative overflow-hidden"
    >
      {/* Sparkle effects on the side */}
      <div className="absolute top-2 right-2 text-cozy-clay animate-pulse">
        <Sparkles className="w-4 h-4 opacity-50" />
      </div>

      {/* Fluffy Mascot Avatar */}
      <motion.div
        animate={isWiggling ? { 
          rotate: [-5, 8, -6, 4, 0],
          y: [-2, 4, -4, 0]
        } : {
          y: [0, -4, 0],
        }}
        transition={isWiggling ? { duration: 0.7 } : { repeat: Infinity, duration: 4, ease: "easeInOut" }}
        onClick={triggerWiggle}
        className="cursor-pointer select-none relative group shrink-0"
      >
        {/* Soft Shadow below Mascot */}
        <div className="absolute -bottom-1 left-2 right-2 h-2 bg-cozy-terracotta/15 rounded-full blur-xs" />

        {/* Mascot Face Body Container */}
        <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full border-2 border-cozy-sand flex flex-col items-center justify-center relative p-1 shadow-inner overflow-hidden">
          {/* Fluffy Cloud Ears */}
          <div className="absolute -left-1 top-2 w-4 h-7 bg-white border-l-2 border-t-2 border-b-2 border-cozy-sand rounded-xl" />
          <div className="absolute -right-1 top-2 w-4 h-7 bg-white border-r-2 border-t-2 border-b-2 border-cozy-sand rounded-xl" />
          
          {/* Cute face layout */}
          <div className="flex flex-col items-center justify-center pt-2">
            {/* Sparkling Eyes */}
            <div className="flex gap-4 mb-1">
              <span className="w-2.5 h-2.5 bg-cozy-terracotta rounded-full flex items-center justify-center relative">
                <span className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
              </span>
              <span className="w-2.5 h-2.5 bg-cozy-terracotta rounded-full flex items-center justify-center relative">
                <span className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
              </span>
            </div>
            
            {/* Rosy Cheeks */}
            <div className="absolute w-full flex justify-between px-2.5 top-6.5">
              <div className="w-2.5 h-1.5 bg-pink-300 rounded-full opacity-70 blur-[0.5px]" />
              <div className="w-2.5 h-1.5 bg-pink-300 rounded-full opacity-70 blur-[0.5px]" />
            </div>

            {/* Tiny Heart Nose & Smiley Mouth */}
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2 bg-cozy-orange rounded-full mt-0.5" />
              <div className="w-3 h-1.5 border-b border-cozy-terracotta rounded-full -mt-0.5" />
            </div>
          </div>

          {/* Cloud decorations on the body */}
          <div className="absolute bottom-0 w-full text-[10px] font-cute text-center bg-cozy-softpeach text-cozy-terracotta font-semibold tracking-wider border-t border-cozy-sand/40">
            포구 🐶
          </div>
        </div>

        {/* Hover label */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 bg-cozy-terracotta text-white text-[10px] px-2 py-0.5 rounded-full transition-transform duration-300 select-none whitespace-nowrap">
          콕 건드려 봐구!
        </div>
      </motion.div>

      {/* Quote Dialog Bubble */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className="relative bg-white border border-cozy-sand/60 px-4 py-3 rounded-2xl md:rounded-3xl shadow-xs">
          {/* Triangle pointing to the avatar */}
          <div className="absolute left-[-8px] top-6 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-white border-b-[8px] border-b-transparent" />
          <div className="absolute left-[-9px] top-6 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-cozy-sand/60 border-b-[8px] border-b-transparent -z-10" />

          <AnimatePresence mode="wait">
            <motion.p
              key={activeText}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-[#5C4B40] text-sm md:text-base font-medium font-cozy leading-relaxed"
            >
              {activeText}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1.5 mt-2 ml-2 text-xs text-cozy-clay font-medium">
          <MessageCircleHeart className="w-3.5 h-3.5 text-cozy-orange shrink-0" />
          <span className="font-cute text-sm">추천 마스터 포구가 성심성의껏 어루만져 드려요</span>
        </div>
      </div>
    </div>
  );
}
