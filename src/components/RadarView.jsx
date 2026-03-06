import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

export default function RadarView({ distance, status }) {
  // Distance in meters (0 to 50 for realistic wifi range indoors)
  const safeDistance = Math.max(0.1, Math.min(50, distance || 50));
  
  // Calculate pulse speed based on distance (closer = faster pulse)
  const pulseDuration = Math.max(0.5, (safeDistance / 50) * 3);
  
  // Calculate scale based on distance (closer = larger central dot)
  const coreScale = Math.max(1, 2 - (safeDistance / 25));

  // Determine colors based on status and distance
  let primaryColor = 'rgba(59, 130, 246, '; // blue-500
  let secondaryColor = '#3b82f6';
  
  if (status === 'available') {
    primaryColor = 'rgba(16, 185, 129, '; // emerald-500
    secondaryColor = '#10b981';
  } else if (status === 'maintenance') {
    primaryColor = 'rgba(245, 158, 11, '; // amber-500
    secondaryColor = '#f59e0b';
  }

  // Generate rings
  const rings = [1, 2, 3];

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto flex items-center justify-center bg-slate-900 rounded-full overflow-hidden border-8 border-slate-800 shadow-2xl">
      {/* Grid background */}
      <div className="absolute inset-0 border border-slate-700/30 rounded-full opacity-50" style={{ 
        backgroundImage: 'radial-gradient(circle at center, transparent 0%, transparent 48%, rgba(255,255,255,0.05) 50%, transparent 52%, transparent 100%)',
        backgroundSize: '20% 20%'
      }}></div>

      {/* Radar scanning line */}
      <motion.div
        className="absolute w-1/2 h-[2px] origin-right right-1/2 top-1/2 bg-gradient-to-l from-transparent to-green-400/50 z-10"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{
          boxShadow: `0 0 20px 2px ${secondaryColor}40`
        }}
      />
      
      {/* Radar gradient fill attached to scanner */}
      <motion.div
        className="absolute w-1/2 h-1/2 origin-bottom-right right-1/2 bottom-1/2 z-0"
        style={{
          background: `conic-gradient(from 180deg at 100% 100%, transparent 0deg, ${primaryColor}0.2) 90deg, transparent 90deg)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* Concentric rings */}
      {rings.map((ring) => (
        <div 
          key={ring}
          className="absolute rounded-full border border-slate-700/50"
          style={{ 
            width: `${ring * 33}%`, 
            height: `${ring * 33}%` 
          }}
        />
      ))}

      {/* Target Dot (the equipment) */}
      <div className="absolute z-20 flex flex-col items-center justify-center">
        {rings.map((ring) => (
          <motion.div
            key={`pulse-${ring}`}
            className="absolute rounded-full"
            style={{ 
              backgroundColor: `${primaryColor}0.4)`,
              width: '40px',
              height: '40px'
            }}
            animate={{ 
              scale: [1, 2.5 + (ring * 0.5)], 
              opacity: [0.8, 0] 
            }}
            transition={{ 
              duration: pulseDuration, 
              repeat: Infinity, 
              delay: ring * (pulseDuration / 3),
              ease: "easeOut"
            }}
          />
        ))}
        
        <motion.div 
          className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] z-30"
          style={{ backgroundColor: secondaryColor }}
          animate={{ scale: coreScale }}
          transition={{ duration: 0.5 }}
        >
          <MapPin className="w-5 h-5 text-white" />
        </motion.div>
        
        <div className="mt-8 bg-slate-800/80 backdrop-blur px-4 py-1.5 rounded-full border border-slate-700 z-30 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" style={{ backgroundColor: secondaryColor }}></span>
          <span className="text-white font-mono font-medium tracking-wider">
            {safeDistance.toFixed(1)}m
          </span>
        </div>
      </div>
    </div>
  );
}