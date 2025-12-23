import React from 'react';
import { motion } from 'motion/react';

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 0,
}) => {
  const words = text.split(' ');

  return (
    <div className={`flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <div key={i} className='overflow-hidden mr-[0.2em]'>
          <motion.span
            style={{ display: 'inline-block' }}
            initial={{ y: '100%', opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
              delay: delay + i * 0.1,
            }}
          >
            {word}
          </motion.span>
        </div>
      ))}
    </div>
  );
};

export default SplitText;
