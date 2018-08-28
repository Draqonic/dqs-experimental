const log = console.log
const print = log
const error = console.error
const debug = console.debug

class DS {
	static get locales() {
		if (!this._locales) this._locales = {}
		return this._locales
	}

	static get locale() { // current locale
		return this._locale
	}

	static set locale(locale) {
		this._locale = locale
	}

	static get availableLocales() {
		if (!this._availableLocales) this._availableLocales = []
		return this._availableLocales
	}

	static set availableLocales(al) {
		this._availableLocales = al
	}

	static tr(text) {
		if (!this.locale) { /* error('Error: The current localization is not set'); */ return text }
		return this.forceTr(text, this.locale)
	}

	static forceTr(text, locale) {
		if (!this.loadLocale(locale))
			return text

		if (text in this.locales[locale]) {
				return this._locales[locale][text]
		}

		return text
	}

	static loadLocale(locale) {
		if (!locale) { error('Error: Сan\'t load locale', locale); return false }
		if (!this.locales[locale]) {
			//log(`Locale '${locale}' loaded`)
			this.locales[locale] = require(`./locale.${locale}`) // check file
		}
		return true
	}
}

DS.availableLocales = ['ru', 'uk'] // need generate

module.exports = DS