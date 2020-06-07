import i18n from 'i18next'
import {initReactI18next} from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import cs from '../translations/cs'
import en from '../translations/en'

i18n
	.use(LanguageDetector) // passes i18n down to react-i18next
	.use(initReactI18next)
	.init({
		resources: {
			en: {translation: en},
			cs: {translation: cs},
		},
		fallbackLng: 'en',

		interpolation: {
			escapeValue: false,
		},
		detection: {
			order: ['navigator'],
		},
	})
