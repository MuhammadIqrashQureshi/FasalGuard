import React from 'react';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="fg-language-toggle-wrap" aria-label={t('appLanguage')}>
      <motion.div
        className="fg-language-toggle"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="fg-language-icon">
          <Languages size={16} />
        </div>

        <div className="fg-language-switch" role="tablist" aria-label={t('appLanguage')}>
          <button
            type="button"
            role="tab"
            aria-selected={language === 'en'}
            className={`fg-language-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
            title={t('switchToEnglish')}
          >
            EN
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={language === 'ur'}
            className={`fg-language-btn ${language === 'ur' ? 'active' : ''}`}
            onClick={() => setLanguage('ur')}
            title={t('switchToUrdu')}
          >
            اردو
          </button>
          <motion.span
            className="fg-language-pill"
            layout
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            animate={{ x: language === 'en' ? 0 : 48 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
