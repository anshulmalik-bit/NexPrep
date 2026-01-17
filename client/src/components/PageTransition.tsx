import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20, /* Slide up from 20px */
        scale: 0.98
    },
    in: {
        opacity: 1,
        y: 0,
        scale: 1
    },
    out: {
        opacity: 0,
        y: -20, /* Slide up to -20px */
        scale: 1.02 /* Slight zoom out on exit */
    }
};

const pageTransition = {
    type: "tween",
    ease: [0.34, 1.56, 0.64, 1], // Spring-like easing
    duration: 0.3
};

export const PageTransition = ({ children }: PageTransitionProps) => {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            style={{ width: '100%', height: '100%' }} // Ensure full size
        >
            {children}
        </motion.div>
    );
};
