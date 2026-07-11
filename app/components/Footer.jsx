'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ScrollReveal from './animations/ScrollReveal';

const QUOTES = [
  { text: "If freedom of speech is taken away, then dumb and silent we may be led, like sheep to the slaughter.", author: "George Washington" },
  { text: "Give me liberty, or give me death!", author: "Patrick Henry" },
  { text: "The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.", author: "Albert Camus" },
  { text: "Freedom is not worth having if it does not include the freedom to make mistakes.", author: "Mahatma Gandhi" },
  { text: "To deny people their human rights is to challenge their very humanity.", author: "Nelson Mandela" },
  { text: "I disapprove of what you say, but I will defend to the death your right to say it.", author: "Evelyn Beatrice Hall" },
  { text: "Those who deny freedom to others deserve it not for themselves.", author: "Abraham Lincoln" },
  { text: "The secret of happiness is freedom, and the secret of freedom is courage.", author: "Thucydides" },
];

export default function Footer() {
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  return (
    <footer className="relative z-10 border-t border-white/[0.04] mt-16">
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        {/* Quote */}
        <ScrollReveal delay={0.1} direction="up" distance={20} className="mb-6">
          <blockquote className="m-0">
            <p className="font-handwriting text-xl sm:text-2xl text-white/30 leading-relaxed italic mb-3">
              &ldquo;{quote.text}&rdquo;
            </p>
            <cite className="font-body text-xs text-white/20 uppercase tracking-widest not-italic">
              — {quote.author}
            </cite>
          </blockquote>
        </ScrollReveal>

        {/* Divider */}
        <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent mb-6" />

        {/* Attribution */}
        <motion.p 
          whileHover={{ scale: 1.05 }}
          className="font-body text-xs text-white/15 cursor-default inline-block"
        >
          Made with <span className="text-neon-magenta/40">❤</span> — A sanctuary for free expression
        </motion.p>
      </div>
    </footer>
  );
}
