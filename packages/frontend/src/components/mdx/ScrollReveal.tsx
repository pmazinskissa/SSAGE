import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeInUp } from '../../lib/animations';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

export default function ScrollReveal({ children, className = '' }: ScrollRevealProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
