// TODO: dubl vars, props
// global braces count (indexOf)
// disable names for vars: https://mathiasbynens.be/notes/reserved-keywords
// info for component: class name, file
// disable control for string: ' "" ` amd functions (move string and funcs as is)

const log = console.log
const warn = console.warning
const err = console.error
const deb = console.debug

const keyWords = ['property', 'function', '{', '}']
const varTypes = ['int', 'number', 'string', 'bool', 'var', 'RegExp', 'Component', 'BigInt']
const varDisableNames = ['do', 'if', 'in', 'for', 'let', 'new', 'try', 'var', 'case', 'else', 'enum', 'eval', 'null', 'this', 'true', 'void',
							'with', 'await', 'break', 'catch', 'class', 'const', 'false', 'super', 'throw', 'while', 'yield', 'delete', 'export',
							'import', 'public', 'return', 'static', 'switch', 'typeof', 'default', 'extends', 'finally', 'package', 'private',
							'continue', 'debugger', 'function', 'arguments', 'interface', 'protected', 'implements', 'instanceof']
const errorText = {
0: 'Global error',
1: 'Сomponent name must begin with a large english letter',
2: 'No opening \'{\' for Component', // TODO
3: 'No close \'{\' for Component', // TODO
4: 'Missing /',
5: 'Property name must stated from lower case symbol',
6: 'Property duplicate',
7: 'You cant use JS keywords for var names',
8: 'Component name can contains only A-Z, a-z, 0-9'
}
const warnText = {
0: '[CodeStyle] Extra semicolon',
1: '[CodeStyle] Brace on a new line'
}

let currentName = 'Item.qml'
let orig = "              \n         \n      Base	// крутой класс\n	  { \n\n  onBarChange : { if (value === 15) console.log ( function(value) { console.log(value) } (value)  } \n       \n\n            \n\n                            \n    property var foo: 6\n\n\n\n  onFooChange: console.log(value) \n        function hello() {}\n       property var bar: 15\n\n\n\n \n     property var baz: foo  ; property   var  kek: 'KEK'             +  bar\n    \n    }"

class DranoqLangPrivateParser {
	constructor(fileName, contents) {
		log('compile', fileName)
		this.fileName = fileName
		this.contents = contents.replace(/\t/g, '    ')
		this.line = 1
		this.column = 1
		this.nextColumn = 1
		this.componentName = 'Unknown'
		this.work()
	}

	logError(error, strlen, full = false) {
		let errorMessage = /*`Error ${error} in */`${this.fileName}`
		let col = this.column
		if (strlen) col -= strlen + 1

		if (this.line)
			errorMessage += `:${this.line}`
		if (col)
			errorMessage += `:${col}`
		errorMessage += `: ${errorText[error]}`

		let currentStr = this.contents.split('\n')[this.line - 1].replace(/\t/g, '    ')
		err(currentStr)
		err(Array(col + 1).join(' ') + (full ? Array(strlen + 1).join('^') : '^'))
		err(errorMessage)
		err()
		err({error, errorText: errorText[error], file: this.fileName, line: this.line, column: col, str: currentStr.trim()})

		return false
	}

	work() {
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
			
			this.column = this.nextColumn
			if (ch === '\n' /*|| ch === '\r'*/) {
				this.line++
				lineComment = false
				this.nextColumn = 1
			} else this.nextColumn++

			if (ch === '/') {
				if (this.contents[i + 1] === '/') {
					lineComment = true
					i++
				} else if (this.contents[i + 1] === '*') {
					globalComment = true
				} else {
					if (this.contents[i - 1] === '*') { globalComment = false; continue; }
						else
					return this.logError(4, str.length)
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
					for(let j = 0; j !== lets.length; ++j) if (lets[j].name === str) return this.logError(6, str.length, true)
					if(str[0] !== str[0].toLowerCase()) return this.logError(5, str.length, true)
					if (varDisableNames.indexOf(str) !== -1) return this.logError(7, str.length, true)
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
				
				strs.push({str, line: this.line, column: this.column})
				str = ''
			} else {
				if (ch === ';' || ch === '\n' || ch === '}')
					expProp.val = false

				isSpace = false
				str += ch
			}

			//log(`'${ch}'`, [' ', '\t', '\n'].indexOf(ch) !== -1)		
		}

		if (!this.checkComponentName(strs[0]))
			return false
		
		// check start and end braces
		if (strs[1].str !== '{') {
			this.line = strs[0].line; this.column = strs[0].column
			return this.logError(2, 0)
		}
		if (strs[strs.length - 1].str !== '}') {
			this.line = strs[strs.length - 1].line; this.column = strs[strs.length - 1].column
			return this.logError(3, 0)
		}

		log(strs)
		log(lets)
		log('Parent name =', this.componentName)

		return true
	}
	
	checkComponentName(str) {
		this.line = str.line; this.column = str.column
		if (!/^[A-Z]+$/.test(str.str[0]))
			return this.logError(1, str.length, false)

		let compNameCheck = /[^A-Za-z0-9]+/g.exec(str.str)
		if (compNameCheck)
			return this.logError(8, str.length - compNameCheck.index)
		this.componentName = str.str
		
		return true
	}
}

class DranoqLang {
	constructor() {
		//log('---------------------');
		//log(' DranoqScript v0.0.1');
		//log('---------------------\n');
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
