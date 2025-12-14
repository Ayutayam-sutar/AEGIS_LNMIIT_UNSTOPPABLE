import React from 'react';
import { motion } from 'framer-motion';

const ShieldCanvas: React.FC = () => {
  return (
    <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center perspective-1000">
      <motion.div
        className="relative w-full h-full flex items-center justify-center"
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Core Shield Shape - Outer Layer */}
        <motion.div
          className="absolute w-48 h-56 md:w-64 md:h-80 border-2 border-aegis-accent/30 bg-aegis-primary/5 backdrop-blur-sm rounded-[50%] rounded-b-[50%] clip-path-shield"
          style={{ transform: "translateZ(20px)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-aegis-accent/10 to-transparent rounded-[inherit]" />
        </motion.div>

        {/* Middle Tech Ring */}
        <motion.div
          className="absolute w-60 h-60 md:w-80 md:h-80 border border-aegis-primary/40 rounded-full"
          style={{ transform: "translateZ(0px) rotateX(60deg)" }}
          animate={{ rotateZ: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
           <div className="absolute top-0 left-1/2 w-2 h-2 bg-aegis-accent rounded-full shadow-[0_0_10px_#00F0FF]" />
           <div className="absolute bottom-0 left-1/2 w-2 h-2 bg-aegis-accent rounded-full shadow-[0_0_10px_#00F0FF]" />
        </motion.div>

        {/* Inner Core */}
        <motion.div
          className="absolute w-32 h-40 md:w-40 md:h-52 bg-gradient-to-tr from-aegis-dark to-aegis-panel border border-aegis-accent/50 shadow-[0_0_30px_rgba(0,240,255,0.2)]"
          style={{
            transform: "translateZ(40px)",
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" // Hexagon-like shield core
          }}
        >
           <div className="absolute inset-0 flex items-center justify-center">
             <motion.div 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 border-2 border-aegis-accent rounded-full"
             />
           </div>
        </motion.div>

        {/* Floating Particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-aegis-gold rounded-full"
            style={{
              transform: `rotateY(${i * 72}deg) translateZ(100px)`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 3,
              delay: i * 0.5,
              repeat: Infinity
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default ShieldCanvas;