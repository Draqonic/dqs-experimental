// TODO: dubl vars, props
// global braces count (indexOf)
// disable names for vars: https://mathiasbynens.be/notes/reserved-keywords
// add support for prop or let together with property
// prop var foor
// let var bar
// info for component: class name, file

const log = console.log
const warn = console.warning
const err = console.error
const deb = console.debug

const keyWords = ['property', 'function', '{', '}']
const varTypes = ['int', 'number', 'string', 'bool', 'var', 'RegExp', 'Component', 'BigInt']
const errorText = {
0: 'Global error',
1: 'Incorrent parent object name',
2: 'No opening \'{\' for Component',
3: 'No close \'{\' for Component',
4: 'Missing /',
5: 'Property name must stated from lower case symbol',
6: 'Property duplicate'
}
const warnText = {
0: '[CodeStyle] Extra semicolon',
1: '[CodeStyle] Brace on a new line'
}

let currentName = 'Item.qml'
let orig = "              \n         \n      Base	// крутой класс\n	  { \n\n  onBarChange : { if (value === 15) console.log ( function(value) { console.log(value) } (value)  } \n       \n\n            \n\n                            \n    property var foo: 6\n\n\n\n  onFooChange: console.log(value) \n        function hello() {}\n       property var bar: 15\n\n\n\n \n     property var baz: foo  ; property   var  kek: 'KEK'             +  bar\n    \n    }"

class DranoqLangPrivateParser {
	constructor(fileName, contents) {
		this.fileName = fileName
		this.contents = contents
		this.line = 1
		this.column = 1
		this.work()
	}

	logError(error) {
		let errorMessage = `E${error} in ${this.fileName}`

		if (line)
			errorMessage += `:${this.line}`
		if (column)
			errorMessage += `:${this.column}`
		errorMessage += `: ${errorText[error]}`

		err(errorMessage)
		let currentStr = this.contents.split(/[\n]/)[line - 1]
		err(currentStr)
		err(Array(column + 1).join(' ') + '^')
		err({version: '0.0.1', error, errorText: errorText[error], file: this.fileName, line: this.line, column: this.column, str: currentStr.replace(/\r/, '')})

		return false
	}
	
	work() {
		let parentName
		// TODO: copy functions, slots, ignore comments
		let isSpace = false
		let strs = []
		let str = ''
		let lineComment = false
		let globalComment = false
		let funcBlock = false
		let cBraces = 0
		let lets = []
		
		let expProp = {type: false, name: false, val: false, colon: false}

		for(let i = 0; i !== this.contents.length; ++i) {
			let ch = this.contents[i]
			
			if (ch === '\n' /*|| ch === '\r'*/) {
				this.line++
				lineComment = false
				this.column = 1
			} else this.column++

			if (ch === '/') {
				if (this.contents[i + 1] === '/') {
					lineComment = true
					i++
				} else if (this.contents[i + 1] === '*') {
					globalComment = true
				} else {
					if (this.contents[i - 1] === '*') { globalComment = false; continue; }
						else
					return this.logError(4)
				}
			}
			
			if (lineComment || globalComment) continue
			
			if ([' ', '\t', '\n', '\r', ':'].indexOf(ch) !== -1) {
				isSpace = true
				if (!str) continue
				//log(expProp)

				if (expProp.val) {
					lets[lets.length - 1].value.push(str)
					
					//log(str.indexOf(';') !== - 1, str.indexOf('\n') !== - 1)
					
					if (ch === ';' || ch === '\n')
						expProp.val = false
				}

				if (expProp.name) {
					for(let j = 0; j !== lets.length; ++j) if (lets[j].name === str) return logError(6)
					if(str[0] !== str[0].toLowerCase()) return logError(5)
					lets[lets.length - 1].name = str
					expProp.name = false
					expProp.colon = true
				}
				//log(ch, expProp.colon, ch === ':')
				
				if (expProp.colon && ch === ':')
					expProp.val = true
				else
					expProp.colon = false

				if (expProp.type) {
					lets[lets.length - 1].type = str
					expProp.type = false
					expProp.name = true
				}
				
				if (str === 'property' || str === 'prop' || str === 'let') {
					lets.push({name: '', type: '', value: []})
					expProp.type = true
				}
				
				strs.push({str, line: this.line, column: this.column - str.length - 1})
				str = ''
			} else {
				if (ch === ';' || ch === '\n' || ch === '}')
					expProp.val = false

				isSpace = false
				str += ch
			}

			//log(`'${ch}'`, [' ', '\t', '\n'].indexOf(ch) !== -1)		
		}

		log(strs)
		log(lets)

		return
		let q = strs

		// check first char upper and first brace, get parent class name
		let fisrtChar = q[0]['str'][0]
		if (fisrtChar !== fisrtChar.toUpperCase())
			return logError(1, fName, q[0]['line'], orig_split[q[0]['line'] - 1])
		parentName = q[0]['str']
		
		// check braces
		if (q[1].str !== '{')
			return logError(2, fName)
		if (q[q.length - 1].str !== '}')
			return logError(3, fName)
		
		//
		let props = []
		let slots = []
		let funcs = []
		let signs = []
		let brace = 0
		let currentProperty = false
		let maybeValue = false
		let maybeOn = false

		for(let i = 1; i !== q.length; ++i) {
			console.log(q[i])
			let str = q[i].str
			let line = q[i].str

			if (str === '{') brace++
			if (str === '}') brace--

			if (str === 'property') {
				currentProperty = true
				props.push({name: '', type: '', value: []})
				continue
			}

			if (currentProperty) {
				let prop = props[props.length - 1]
				if (!prop.type)
					prop.type = str
				else {
					if(str[str.length - 1] === ':') str = str.substring(0, str.length - 1)
					prop.name = str
					currentProperty = false
					maybeValue = true
				}
				continue
			}
			
			let ifOn = str.substring(0, 2) === 'on'
			if (ifOn) { maybeOn = true; if(str[str.length - 1] === ':') str = str.substring(0, str.length - 1); slots.push({name: str, value: []}) }
			if (maybeValue) {
				//log('maybe', str, keyWords.indexOf(str) !== -1)
				if (ifOn || keyWords.indexOf(str) !== -1) {
					maybeValue = false
					if (!ifOn) maybeOn = false
					continue
				}
				props[props.length - 1].value.push(str)
				continue
			}

			if (maybeOn) {
				if (!ifOn)
					slots[slots.length - 1].value.push(str)
				continue
			}
		}
		
		for(const slot of slots) {
			if (slot.value[0] === ':') slot.value.splice(0, 1);
			if(slot.value[0] === '{' && slot.value[slot.value.length - 1] === '}') {
				slot.value.splice(0, 1); slot.value.splice(slot.value.length - 1, 1)
			}
			slot.value = slot.value.join(' ')
		}
		
		log('Brace =', brace)
		if (brace)
			logError(0, fName, 0, '')

		//log('parentName', parentName)
		log(slots)
		log(props)
		//log('Lines:', line)
	}
}

class DranoqLang {
	constructor() {
		log('DranoqScript v0.0.1');
	}

	load(fileOrStr, isStr = false) {
		if (isStr) {
			new DranoqLangPrivateParser('string', fileOrStr);
		} else {
			const fs = require('fs');
			fs.readFile(fileOrStr, 'utf8', (error, contents) =>
				new DranoqLangPrivateParser(fileOrStr, contents)
			);
		}
 
		return true;
	}
}

let lang = new DranoqLang
lang.load('test.dqs')
//lang.work('Item.qml', orig)
//log(orig)
//log('Done')