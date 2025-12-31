'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => setLanguage('ar')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'ar'
            ? 'bg-primary text-white'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
        aria-label="Switch to Arabic"
      >
        AR
      </button>
      <button
        onClick={() => setLanguage('fr')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          language === 'fr'
            ? 'bg-primary text-white'
            : 'text-gray-700 hover:bg-gray-200'
        }`}
        aria-label="Switch to French"
      >
        FR
      </button>
    </div>
  )
}
