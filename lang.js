// TODO: dubl vars, props
// global braces count (indexOf)
// disable names for vars: https://mathiasbynens.be/notes/reserved-keywords
// info for component: class name, file
// disable control for string: ' "" ` amd functions (move string and funcs as is)
// copy functions, slots, ignore comments and funcs

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
8: 'Component name can contains only A-Z, a-z, 0-9',
9: 'Error */'
}
const warnText = {
0: '[CodeStyle] Extra semicolon',
1: '[CodeStyle] Brace on a new line'
}

class DranoqLangPrivateParser {
	constructor(fileName, contents) {
		log('compile', fileName)
		this.fileName = fileName
		this.contents = contents.replace(/\t/g, '    ').replace(/\r/g, '')
		this.line = 1
		this.column = 1
		this.nextColumn = 1
		this.componentName = 'Unknown'
		try {
			this.work()
		} catch(err) {
			log(err)
		}
	}

	logError(error, strlen, full = false) {
		let errorMessage = /*`Error ${error} in */`${this.fileName}`
		let col = this.column
		if (strlen) col -= strlen + 1

		errorMessage += `:${this.line}:${col}`
		errorMessage += `: ${errorText[error]}`

		let currentStr = this.contents.split('\n')[this.line - 1].replace(/\t/g, '    ')
		err(currentStr)
		err(Array(col + 1).join(' ') + (full ? Array(strlen + 1).join('^') : '^'))
		err(errorMessage)
		err()

		throw {error, errorText: errorText[error], file: this.fileName, line: this.line, column: col, str: currentStr.trim()}
	}

	work() {
		let strs = []
		let str = ''
		let funcBlock = false
		let cBraces = 0
		let lets = []
		
		let comments = {line: false, global: false}
		let expProp = {type: false, name: false, val: false, colon: false, check: function() { return this.type || this.name || this.val || this.colon } }

		for(let i = 0; i !== this.contents.length; i++) {
			let ch = this.contents[i]

			// line/column counter and \n action
			this.column = this.nextColumn
			if (ch === '\n') {
				this.line++
				comments.line = false
				this.nextColumn = 1
			} else this.nextColumn++

			// comments check and continue if comments mode
			switch(this.checkComments(comments, ch, str, i)) {
				case false: return false
				case 2: continue; break
				case 3: i++; break
			}
			if (comments.line || comments.global) continue

			if ([' ', '\t', '\n', ':'].indexOf(ch) !== -1) {
				if (!str) continue

				this.checkProperty(lets, expProp, str, ch)

				//if (!expProp.check())
					strs.push({str, line: this.line, column: this.column, toString: function() { return this.str } })
				str = ''
			} else {
				if (ch === ';' || ch === '\n' || ch === '}')
					expProp.val = false

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

		log(strs.join(' '))
		log(lets)
		log('Parent name =', this.componentName)

		return true
	}
	
	checkComments(comments, ch, str, i) {
		// 1 - nothing, 2 - continue, 3 - i++
		let chPrev = this.contents[i - 1], chNext = this.contents[i + 1]
		
		if (ch === '/') {
			if (chPrev === '*' && comments.global && this.contents[i - 2] !== '/' && !comments.line)
				comments.global = false
			else if (chNext === '*' && !comments.line) {
				comments.global = true
				//return 3
			}
			else if ((chNext === '/' || chPrev === '/'))
				comments.line = true
			else {
				if (chPrev === '*' && !comments.global) throw this.logError(9)
				if (!comments.line) throw this.logError(4)
			}
			
			return 2
		}

		return 1
	}

	checkComponentName(str) {
		if (!str) return false
		this.line = str.line; this.column = str.column
		if (!/^[A-Z]+$/.test(str.str[0]))
			return this.logError(1, str.length, false)

		let compNameCheck = /[^A-Za-z0-9]+/g.exec(str.str)
		if (compNameCheck)
			throw this.logError(8, str.length - compNameCheck.index)
		this.componentName = str.str
		
		return true
	}
	
	checkProperty(lets, expProp, str, ch) {
		if (expProp.val) {
			lets[lets.length - 1].value.push(str)
	
			if (ch === ';' || ch === '\n')
				expProp.val = false
		}

		if (expProp.name) {
			for(let j = 0; j !== lets.length; ++j) if (lets[j].name === str) throw this.logError(6, str.length, true)
			if(str[0] !== str[0].toLowerCase()) throw this.logError(5, str.length, true)
			if (varDisableNames.indexOf(str) !== -1) throw this.logError(7, str.length, true)
			lets[lets.length - 1].name = str
			expProp.name = false
			expProp.colon = true
		}

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
try{
lang.load('test.dqs') } catch(err) { log('!!!!!!!!!!!!', err) }
