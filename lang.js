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
0: 'Total error',
1: 'Сomponent name must begin with a large english letter',
2: 'Component name can contains only A-Z, a-z, 0-9',
3: 'No opening {',
4: 'No close }', 
5: 'Missing /',
6: 'Property name must stated from lower case symbol', // TODO
7: 'Property duplicate', // TODO
8: 'You cant use JS keywords for var names', // TODO
9: 'Error */' // TODO
}
const warnText = {
0: '[CodeStyle] Extra semicolon',
1: '[CodeStyle] Brace on a new line'
}

class DSParser {
	constructor(text, fileName) {
		if (fileName)
			log('compile', fileName)
		this.fileName = fileName
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
		if (!l || !c) {
			err('Error:', errorText[errNumber])
			throw {error: errNumber, errorText: errorText[errNumber]}
			return
		}
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

		this.funcs = []
		let func = ''
		let b = {count: 0, mode: false, i: -1}
		let tempB

		for(let i = 0; i !== all.length; i++) {
			let str = ''
			if (!all[i]) continue
			all[i] += ' '
			let abort = false

			for(let j = 0; j !== all[i].length && !abort; ++j) {
				let ch = all[i][j]

				if (ch === '/' && !b.mode) { // one-line comments
					if (all[i][j - 1] === '/' || all[i][j + 1] === '/') {
						abort = true
						continue 
					}
					else
						throw this.logError(5, i, j)
				}

				if (ch === '{') {
					if (!tempB)
						tempB = true
					else
						b.mode = true
				}	

				if (b.mode) { // TODO: inline slot
					if (ch === '{') { b.count++; b.start = true }
					if (ch === '}') b.count--
					func += ch

					if ((b.count === 0 && b.start) || !b.mode) {
						let newFunc = func.trim(); func = ''
						if (newFunc[0] !== '{' || i === all.length - 2) throw this.logError(0) // TODO: fix
						b.mode = false; b.start = false
						//this.funcs[this.funcs.length - 1].body = newFunc
						strs.push({s: newFunc, l: i, c: j, func: true })
					}
				} else if (ch === ';') { // add objs to array, not add
					if (strs[strs.length - 1].s !== '\n') strs.push({s: '\n'})
				} else if (ch !== ' ')
					str += ch
				else {
					if (str) {// TODO: maybe not add symbols at end?
						// if (strs[strs.length - 1])
						// log(strs[strs.length - 1].s, str.substr(0, 2) === 'on')
						// log(str, str.substr(0, 2) === 'on', strs[strs.length - 1])
						// if (str.substr(0, 1) === 'on' && (strs[strs.length - 1] && strs[strs.length - 1].s === '\n')) {
						// 	b.mode = true
						// 	this.funcs.push({name: str, body: ''})
						// }
						if (!b.mode)
							strs.push({s: str, l: i, c: j - str.length })
					}
					str = ''
				}
			}

			if (strs[strs.length - 1] && strs[strs.length - 1].s !== '\n')
				strs.push({s:'\n'})
		}
		if (func) throw this.logError(0) // TODO

		if (strs[0].s === '\n') strs.splice(0, 1)
		if (strs[1].s === '\n') strs.splice(1, 1)
		if (strs[strs.length - 1].s === '\n') strs.splice(strs.length - 1, 1)

		//log(this.funcs)
		log(this.strs)
	}

	work() { // function, prop, Class, on
		let strs = this.strs
		// log(strs)
		return

		this.checkComponentName(strs[0].s)

		// // check start and end braces
		// if (strs[1][0].s !== '{') {
		// 	log(strs[1][0])
		// 	return this.logError(2, strs[0][0].l, strs[0][0].c + strs[0][0].s.length)
		// }
		// let strsLast = strs[strs.length - 1]
		// if (strsLast[strsLast.length - 1].s !== '}') {
		// 	return this.logError(3, strsLast[strsLast.length - 1].l, strsLast[strsLast.length - 1].c)
		// } 	
		//let sss = [] // sss.push(str.s)

		// check start and end braces
		if (strs[1].s !== '{')
			throw this.logError(3)
		if (strs[strs.length - 1].s !== '}' && strs[strs.length - 1].s[strs[strs.length - 1].s.length - 1] !== '}')
			throw this.logError(4)

		//log(strs)

		let g = 0

		let b = {func: false, openBrace: false}
		let braces = 0
		let props
		let funcs
		let slots

		for(let i = (strs[2].s === '\n' ? 3 : 2); i !== strs.length; ++i) {
			let str = strs[i]
		//	log(str)


		}

		// for(let i = 0; i !== strs.length; ++i) {
		// 	let strg = strs[i], abort = false

		// 	for(let j = 0; j !== strg.length && !abort; ++j) {
		// 		let str = strg[j]
		// 		let s = str.s, l = str.l, c = str.c
				

		// 		if (str.s.substr(0, 2) === 'on') {
		// 			b.openBrace = true
		// 		}
		// 		if (b.openBrace) {
		// 			log(s)
		// 			b.openBrace = false
		// 		}

		// 		log(str, b)

		// 		g++
		// 	}
		// }
	}

	checkComponentName(str) {
		if (!str) return
		this.line = str.line; this.column = str.column
		if (!/^[A-Z]+$/.test(str[0]))
			return this.logError(1)

		let compNameCheck = /[^A-Za-z0-9]+/g.exec(str)
		if (compNameCheck)
			throw this.logError(2)
		this.componentName = str.str
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
			new DSParser(fileOrStr);
		} else {
			const fs = require('fs');
			fs.readFile(fileOrStr, 'utf8', (error, text) =>
				new DSParser(text, fileOrStr)
			);
		}
 
		return true;
	}
}

const script = new DranoqScript
script.load('app/test.dqs')


				// if (c === 1 && str.s !== '{')
				// 	throw this.logError(2, strs[0][0].l, strs[0][0].c + strs[0][0].s.length)
				// log(c, strs.length, str.s, c === strs.length - 1)
				// if (c === strs.length - 1 && str.s !== '}') {
				// 	log(c, str)
				// 	throw this.logError(3, str.l, str.c + str.s.length)
				// }