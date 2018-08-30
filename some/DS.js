const log = console.log
const warn = console.warn
const error = console.error
const debug = console.debug
const print = log

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



	static bind(func) {
		let up = func
		let upd = up.toString()
		let arr = []
		let spl = upd.split(/[\s\n*{}=():\+]+/)
		//log(spl)
		for(let i = 0; i !== spl.length; ++i) {
			let w = spl[i], prev = spl[i - 1], pprev = spl[i - 2], next = spl[i + 1], nnext = spl[i + 2];
			if (w && ['return', 'function'].indexOf(w) === -1 && !!isNaN(parseFloat(w))) {
				// log(w)
				if (w === 'this') {
					let ws = w.indexOf('.') !== -1
					let ns = next.indexOf('.') !== -1
					let nns = nnext.indexOf('.') !== -1
					if(ws || ns || nns) {
						//log(w, next, nnext)
						//log(ws, ns, nns)

						if (w === 'this' && next === '.') {
							arr.push({this: true, v: nnext, from: 1})
							//	log('var = this', nnext)
						}
						if (w === 'this' && next[0] === '.' && next.length > 1) {
							arr.push({this: true, v: next.substr(1, next.length - 1), from: 2})
						//	log('var = this', next.substr(1, next.length - 1))
						}
					}
				}

				if (w.substr(0, 5) === 'this.' && w.length > 5) {
					//log('!!!!!!!!!!!!!!', w)
					arr.push({this: true, v: w.substr(5, w.length - 1), from: 3})
				}
			}
		}


		// log(arr)
		let kkk = {this: []}
		for(const or of arr) {
			if (kkk.this.indexOf(or.v) === -1)
				kkk['this'].push(or.v)
			// kkk.push({this: or.this, v: or.v})
		}

// log(kkk)

		// log(res)
		// this.bind(prop, func, ...res)

		return { DSBind: kkk, DSFunc: func }
	}
}

DS.availableLocales = ['ru', 'uk'] // need generate

module.exports = DS