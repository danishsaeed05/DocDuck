import React from 'react';
import { motion } from 'motion/react';

const AppLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <motion.div
        className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 shadow-lg"
        animate={{ rotate: [0, 1080, 1080] }}
        transition={{
          duration: 2.5,
          times: [0, 0.8, 1],
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <img 
          src="/DocDuck.png" 
          alt="DocDuck Loader" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </motion.div>
    </div>
  );
};

export default AppLoader;
