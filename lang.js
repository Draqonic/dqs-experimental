// TODO: dubl vars, props
// global braces count (indexOf)
// disable names for vars: https://mathiasbynens.be/notes/reserved-keywords
// info for component: class name, file
// disable control for string: ' "" ` amd functions (move string and funcs as is)
// copy functions, slots, ignore comments and funcs

'use strict';
const log = console.log
const warn = console.warn
const err = console.error
const deb = console.debug

const warnEnabled = false
//const keyWords = ['property', 'function', '{', '}']
const varTypes = ['int', 'number', 'string', 'bool', 'any', 'enum'] // TODO: const, BigInt, lazy
//TODO: all with big char, string, примитив
const varDisableNames= ['do', 'if', 'in', 'for', 'let', 'new', 'try', 'var', 'case', 'else', 'enum', 'eval', 'null', 'this', 'true', 'void',
							'with', 'await', 'break', 'catch', 'class', 'const', 'false', 'super', 'throw', 'while', 'yield', 'delete', 'export',
							'import', 'public', 'return', 'static', 'switch', 'typeof', 'default', 'extends', 'finally', 'package', 'private',
							'continue', 'debugger', 'function', 'arguments', 'interface', 'protected', 'implements', 'instanceof', 'undefined ',
							'null', 'boolean', 'string', 'RegExp', 'prop'] // TODO: disable prop any id
const errorText = {
	0: 'Total error',
	1: 'Сomponent name must begin with a large english letter',
	2: 'Component name can contains only A-Z, a-z, 0-9',
	3: 'No opening {',
	4: 'No close }', 
	5: 'Missing /',
	6: 'Property name must stated from lower case symbol', // TODO
	7: 'Property duplicate', // TODO
	8: 'You cant use JS keywords and DS type for var names', // TODO
	9: 'Error */', // TODO
	10: 'No close } for {',
	11: 'Unknown property type'
}
const warnText = {
	0: '[CodeStyle] Extra semicolon', // TODO
	1: '[CodeStyle] Open brace on a new line'
}

class DSParser {
	constructor(text, fileName) {
		if (fileName)
			log('compile', fileName)
		this.fileName = fileName
		this.text = text.replace(/\t/g, '    ')
		this.all = this.text.split('\n')
		this.strs = []
		this.nextColumn = 1
		this.componentName = 'Unknown'

		this.imports = []
		this.props = []
		this.funcs = []
		this.slots = []
		this.objs = []
		this.propFuncs = []

		try {
			this.firstStep()
			this.work()
		} catch(err) {
			log(err)
		}
	}

	logError(errNumber, l, c, full, isWarn) {
		let errorT = isWarn ? warnText[errNumber] : errorText[errNumber]
		if ((!l || !c) && !isWarn) {
			err('Error:', errorT)
			throw {error: errNumber, errorText: errorT}
			return
		}
		let errorMessage = `${this.fileName}:${++l}:${++c}: ${errorT}`
		let currentStr = this.all[l - 1].replace(/\t/g, '    ').replace(/\r/g, '    ')

		err(currentStr)
		err(Array(c + 1).join(' ') + (full ? Array(full + 1).join('^') : '^'))
		err(errorMessage)
		err()

		if (!isWarn)
			throw {error: errNumber, errorText: errorText[errNumber], file: this.fileName, line: l, column: c, str: currentStr.trim()}
	}
	
	logWarn(warnNumber, l, c) {
		if(warnEnabled)
			this.logError(1, l, c, 0, true)
	}

	firstStep() {
		let all = this.all, strs = this.strs
		let funcPrevI

		let func = ''
		let b = {count: 0, mode: false, i: -1}
		let tempB, tempI, tempJ, tempBB

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
					if (strs[strs.length - 1] && strs[strs.length - 1].s === '\n' && !b.mode)
						this.logWarn(1, i, j - 1)

					if (!tempB)
						tempB = true
					else {
						b.mode = true
						if (!tempBB) {
							tempI = i, tempJ = j
							tempBB = true
						}
					}
				}	

				if (b.mode) { // TODO: inline props, slot
					if (ch === '{') {
						b.count++
						b.start = true
					}
					if (ch === '}') b.count--
					if (ch !== '\r') {
						if (funcPrevI !== i) func += '\n'
						func += ch
						funcPrevI = i
					}

					if ((b.count === 0 && b.start) || !b.mode) {
						let newFunc = func.trim(); func = ''
						if (newFunc[0] !== '{' || i === all.length - 2) throw this.logError(10, tempI, tempJ)
						b.mode = false; b.start = false; tempBB = false
						//this.funcs[this.funcs.length - 1].body = newFunc
						strs.push({s: newFunc, l: tempI, c: tempJ, func: true })
					}
				} else if (ch !== ' ' || ch === ':') {
					if (ch === ':')
						strs.splice(strs.length - (all[i][j - 1] === ' ' ? 1 : 0), 0, {s: ':', v: true, l: i, c: j})
					else if (ch !== ';' && ch !== '\r')
						str += ch
				}
				else {
					if (str) {// TODO: maybe not add symbols at end?
						if (!b.mode)
							strs.push({s: str, l: i, c: j - str.length })

							
					}

					// TODO
					//if (ch === ';' && strs[strs.length - 1].s !== '\n')
					//	strs.push({s: '\n'})

					str = ''
				}
			}

			// TODO
			//if (strs[strs.length - 1] && strs[strs.length - 1].s !== '\n') {
			//	strs.push({s:'\n'})
			//}
		}
		if (func) throw this.logError(0) // TODO
		if (strs[0].s === '\n') strs.splice(0, 1)
		if (strs[1].s === '\n') strs.splice(1, 1)
		if (strs[strs.length - 1].s === '\n') strs.splice(strs.length - 1, 1)
	}

	work() { // function, prop, Class, on
		let strs = this.strs
		let id

		this.checkComponentName(strs[0].s)
		this.checkFirstLastBraces()
		this.componentName = strs[0].s
		strs.splice(0, 2)
		strs.splice(strs.length - 1, 1)

		let funcs = [] // TODO
		let childs = []
		let slots = [] // done
		let newProps = [] // done
		let chProps = [] // done
		for(let i = 0; i !== strs.length; ++i) {
			let pprev = strs[i - 2], prev = strs[i - 1], str = strs[i], next = strs[i + 1], nnext = strs[i + 2], nnnext = strs[i + 3]
			if (str.s === ':') {
				if (pprev && pprev.s === 'prop') { // if new prop with value
					this.checkVar(next, prev)
					let value
					if (nnext) {
						value = nnext.s
						
						if (/^[A-Z]+$/.test(nnext.s[0])) {
							// TODO: if (func)
							if (nnnext)
								value += nnnext.s
						}
					}
					if (varTypes.indexOf(prev.s) === -1) this.logError(11, prev.l, prev.c - 1, prev.s.length)
					if (newProps.map(function(n) { return n.s; }).indexOf(nnext.s) !== -1) logError(8) // TODO
					newProps.push({name: next.s, type: prev.s, value})
				}
			}

			if (str.s === 'prop' && nnext.s !== ':') {
				this.checkVar(nnext, next)
				if (newProps.indexOf(nnext.s) !== -1) logError(8)
				newProps.push({name: nnext.s, type: next.s, value: ''})
			}

			if (pprev && pprev.s !== 'prop' && str.s === ':') {
				if (next.s.substr(0, 2) === 'on') {
					slots.push({name: next.s, value: nnext.s})
				} else if (next.s[next.s.length - 1] === ')') {
					//log('this is function')
				} else { // change parent properties // TODO: check '.'
					if (next.s === 'id') {
						if (id) this.logError(7, next.l, next.c - 2, 2)
						id = nnext.s
					} else
						chProps.push({name: next.s, value: nnext.s})
				}
			}
		}
		//TODO: parse tr(name, comment)

		this.fileName = 'Item' // TODO
		if (this.componentName === 'Object') this.componentName = 'DSObject'
		// log(newProps)
		// log(chProps)
		log(slots)
		let sp = ' '.repeat(4)
		let Class = `class ${this.fileName} extends ${this.componentName} {\n${sp}constructor() {\n${sp}${sp}super()\n`

		if (newProps.length > 0) {
			Class += `${sp}${sp}this.addProperties([`

			for(const kek of newProps) {
				if (kek.type !== 'lazy' && kek.type !== 'enum') { // TODO
					Class += `['${kek.name}', '${kek.type}'`
					// Class += `\n${sp}${sp}addProperty('${kek.name}', '${kek.type}'`

					Class += '], '
				}
			}
			Class += '])'
		}


		for(const kek of newProps) {
			if (kek.type !== 'lazy' && kek.type !== 'enum') { // TODO
				if (kek.value) {
					if (kek.value[0] === '{' && kek.value[kek.value.length - 1] === '}') // TODO
						kek.value = kek.value.substr(1, kek.value.length - 2)
					Class += `${sp}${sp}this._${kek.name} = ${kek.value.replace(/\s+/g, ' ').trim()}\n`
				}
			}
		}

		for(const kek of slots) {
			Class += `${sp}${sp}this.${kek.name} = function(value, old) ${kek.value}\n`
		}

		for(const kek of chProps) {
			Class += `${sp}${sp}this.${kek.name} = ${kek.value}\n`
		}


		Class += '\n    }'
		Class += '\n}\n\n'

		Class += `const ${id} = new ${this.fileName}()\n`

		//for(const kek of slots) {
		//	Class += `${id}.${kek.name} = function(value, old) ${kek.value}\n`
		//}




		

		log(Class)
		let bar = 'sss'
		
	}

	checkComponentName(str) {
		if (!str) return

		if (!/^[A-Z]+$/.test(str[0]))
			return this.logError(1)

		let compNameCheck = /[^A-Za-z0-9]+/g.exec(str)
		if (compNameCheck)
			throw this.logError(2)
	}

	checkFirstLastBraces() {
		let strs = this.strs

		if (strs[1].s !== '{')
			throw this.logError(3)
		if (strs[strs.length - 1].s !== '}' && strs[strs.length - 1].s[strs[strs.length - 1].s.length - 1] !== '}')
			throw this.logError(4)
	}

	checkVar(name, type) {
		// TODO: check first symbol (not digit or big num), disable symbols
		if (varTypes.indexOf(type.s) === -1)
			this.logError(11, type.l, type.c - 1, type.s.length)
		if (varTypes.indexOf(name.s) !== -1 ||
			varDisableNames.indexOf(name.s) !== -1)
				this.logError(8, name.l, name.c - 2, name.s.length)
	}
}

class DranoqScript {
	constructor() {
		//log('---------------------');
		//log(' DranoqScript v0.0.1');
		//log('---------------------\n');
	}

	load(mainFile) {
		const fs = require('fs');
		if (!fs.existsSync(mainFile)) {
			err(`Error load file ${mainFile}`);
			return;
		}

		fs.readFile(mainFile, 'utf8', (error, text) => {
			if (error) err('Error?')
			new DSParser(text, mainFile)
		});
		return true;
	}
}

const script = new DranoqScript
script.load('app/app.dqs')
// setTimeout(() => console.log('end'), 10000000)
// script.start()
// script.exec()
