// TODO: dubl vars, props
// global braces count (indexOf)
// disable names for vars: https://mathiasbynens.be/notes/reserved-keywords
// info for component: class name, file
// disable control for string: ' "" ` amd functions (move string and funcs as is)
// copy functions, slots, ignore comments and funcs

'use strict';
const log = console.log
const warn = console.warning
const err = console.error
const deb = console.debug

const keyWords = ['property', 'function', '{', '}']
const varTypes = ['int', 'number', 'string', 'bool', 'var', 'RegExp', 'Component', 'BigInt']
const varDisableNames = ['do', 'if', 'in', 'for', 'let', 'new', 'try', 'var', 'case', 'else', 'enum', 'eval', 'null', 'this', 'true', 'void',
							'with', 'await', 'break', 'catch', 'class', 'const', 'false', 'super', 'throw', 'while', 'yield', 'delete', 'export',
							'import', 'public', 'return', 'static', 'switch', 'typeof', 'default', 'extends', 'finally', 'package', 'private',
							'continue', 'debugger', 'function', 'arguments', 'interface', 'protected', 'implements', 'instanceof', 'Object', 'Boolean', 'String']
const errorText = {
0: 'Global error',
1: 'Сomponent name must begin with a large english letter',
2: 'No opening \'{\' for Component',
3: 'No close \'{\' for Component',
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

class DranoqScriptPrivateParser {
	constructor(text, fileName) {
		if (fileName)
			log('compile', fileName)

		this.text = text.replace(/\t/g, '    ').replace(/\r/g, '')
		this.all = this.text.split('\n')
		this.strs = []
		this.nextColumn = 1
		this.componentName = 'Unknown'

		try {
			this.firstStep()
			this.work()
		} catch(err) {
			log(err)
		}
	}

	logError(errNumber, l, c, full) {
		let errorMessage = `${this.fileName}:${l}:${c}: ${errorText[errNumber]}`
		let currentStr = this.all[l - 1].replace(/\t/g, '    ').replace(/\r/g, '    ')

		err(currentStr)
		err(Array(c + 1).join(' ') + (full ? Array(full + 1).join('^') : '^'))
		err(errorMessage)
		err()

		throw {error: errNumber, errorText: errorText[errNumber], file: this.fileName, line: l, column: c, str: currentStr.trim()}
	}

	firstStep() {
		let all = this.all, strs = this.strs

		for(let i = 0; i !== all.length; i++) {
			let str = ''
			if (!all[i]) continue
			strs.push([{l: i + 1}])
			all[i] += ' ' // hac
			let abort = false

			for(let j = 0; j !== all[i].length && !abort; ++j) {
				let ch = all[i][j]

				if (ch === '/') {
					if (all[i][j - 1] === '/' || all[i][j + 1] === '/') {
						abort = true
						continue 
					}
					else
						throw this.logError(4, i + 1, j)
				}

				if (ch === ';')
					strs.push([{l: i + 1}])
				else if (ch !== ' ')
					str += ch
				else {
					if (str)
						strs[strs.length - 1].push({s: str, c: j + 1 - str.length })
					str = ''
				}
			}
		}
	}

	work() {
		log(this.strs)
	}
}

class DranoqScript {
	constructor() {
		//log('---------------------');
		//log(' DranoqScript v0.0.1');
		//log('---------------------\n');
	}

	load(fileOrStr, isStr = false) {
		if (isStr) {
			new DranoqScriptPrivateParser(fileOrStr);
		} else {
			const fs = require('fs');
			fs.readFile(fileOrStr, 'utf8', (error, text) =>
				new DranoqScriptPrivateParser(text, fileOrStr)
			);
		}
 
		return true;
	}
}

const script = new DranoqScript
script.load('test.dqs')