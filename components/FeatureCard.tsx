import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const xPos = event.clientX - left;
    const yPos = event.clientY - top;
    

    const xPct = xPos / width - 0.5;
    const yPct = yPos / height - 0.5;
    
    x.set(xPct * 20); 
    y.set(yPct * -20); 
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const transform = useMotionTemplate`perspective(1000px) rotateX(${mouseY}deg) rotateY(${mouseX}deg)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ transform, transformStyle: 'preserve-3d' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative group h-full cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-aegis-accent to-aegis-primary opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-xl" />
      <div className="relative h-full bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 p-8 rounded-xl flex flex-col items-start gap-4 transition-colors hover:border-aegis-accent/50 dark:hover:bg-white/10 shadow-lg dark:shadow-none">
        <div className="p-3 bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-black rounded-lg border border-gray-200 dark:border-white/10 text-blue-600 dark:text-aegis-accent shadow-[0_0_15px_rgba(37,99,235,0.2)] dark:shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-wide">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm font-light">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;