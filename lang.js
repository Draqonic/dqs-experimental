// TODO: dubl vars, props
// global braces count (indexOf)
// disable names for vars: https://mathiasbynens.be/notes/reserved-keywords
// info for component: class name, file
// disable control for string: ' "" ` amd functions (move string and funcs as is)
// copy functions, slots, ignore comments and funcs

class Timer {
	static singleShot(interval, func) {
		setTimeout(func, interval)
	}
}

'use strict';
const log = console.log
const warn = console.warning
const err = console.error
const deb = console.debug

const warnEnabled = false
//const keyWords = ['property', 'function', '{', '}']
const varTypes = ['int', 'number', 'string', 'bool', 'var', 'any', 'enum', 'lazy', 'const', 'RegExp', 'BigInt'] // TODO: remove var
//TODO: all with big char, string, примитив
const varDisableNames = ['do', 'if', 'in', 'for', 'let', 'new', 'try', 'var', 'case', 'else', 'enum', 'eval', 'null', 'this', 'true', 'void',
							'with', 'await', 'break', 'catch', 'class', 'const', 'false', 'super', 'throw', 'while', 'yield', 'delete', 'export',
							'import', 'public', 'return', 'static', 'switch', 'typeof', 'default', 'extends', 'finally', 'package', 'private',
							'continue', 'debugger', 'function', 'arguments', 'interface', 'protected', 'implements', 'instanceof', 'boolean', 'string']
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
		this.text = text.replace(/\t/g, '    ').replace(/\r/g, '')
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
			// this.exp()
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

	exp() {
		let all = this.all, strs = this.strs
		//let m = {b, v} // mode.brace/value
		let mode = false
		let val

		let comp = {name: '', right: false}
		for(let i = 0; i !== all.length; i++) {
			let strTemp = ''
			if (!all[i]) continue
			all[i] += ' '
			for(let j = 0; j !== all[i].length; ++j) {
				let ch = all[i][j]
				
				if (ch === ' ') {
					let str = strTemp.trim()
					if (str) {
						strs.push({str, l: i, c: j})
					}
					strTemp = ''
				}
				else {
					if (ch === ':')
						strs.splice(strs.length - (all[i][j - 1] === ' ' ? 1 : 0), 0, {str: ':', v: true, l: i, c: j})
					else
						strTemp += ch
				}
			}
		}
		comp.name = strs[0].str
		if (strs[1].str === '{' && strs[strs.length - 1].str === '}') {
			strs.splice(0, 2)
			strs.splice(strs.length - 1, 1)
			comp.right = true
		}

		let strs2 = []
		let props = []
		for(let i = 0; i !== strs.length; ++i) {
			let str = strs[i]
			log(str)
			if (str.v) {
				
			}

		}

		log(strs2)
		// log(comp)

		return

		for(let i = 0; i !== all.length; i++) {
			let str = ''
			if (!all[i]) continue
			all[i] += ' '
			let abort = false
			let modeStop
			let last = ''

			for(let j = 0; j !== all[i].length && !abort; ++j) {
				let ch = all[i][j]



				
				let sss = str.trim()
				if (ch === ' ' || ch === ':') {
					if ((!mode || sss.indexOf(':')) && sss)
						strs.push({sss, mode})
					last = str
					str = ''
				}
				else
					str += ch
				
				if (ch === ':')
					mode = true			


				// 	if (modeStop) {
				// 		if (val)
				// 			strs.push({val})
				// 		val = ''
				// 		mode = false
				// 	}
				// 	if (mode)
				// 		val += ch

				if (str[str.length - 1] && str[str.length - 1].sss === ':') {
					strs[strs.length - 1].mode = false
					log('>>>', strs[strs.length - 1].sss)
				}
				if ((str === 'prop' || (str[str.length - 1] && str[str.length - 1].sss === ':')) && mode)
					mode = false

				if (last) log(last)
			}
		}
		// log(val)

		// log(strs)
	}

	firstStep() {
		let all = this.all, strs = this.strs

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

				if (b.mode) { // TODO: inline slot
					if (ch === '{') {
						b.count++
						b.start = true
					}
					if (ch === '}') b.count--
					func += ch

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
					else if (ch !== ';')
						str += ch
				}
				else {
					if (str) {// TODO: maybe not add symbols at end?
						if (!b.mode)
							strs.push({s: str, l: i, c: j - str.length })

							
					}

					//if (ch === ';' && strs[strs.length - 1].s !== '\n')
					//	strs.push({s: '\n'})

					str = ''
				}
			}

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
		// let prev = (i) => this.strs[i - 1] ? (this.strs[i - 1].s === '\n' ? this.strs[i - 2] : this.strs[i - 1]) : undefined
		// let next = (i) => this.strs[i + 1] ? (this.strs[i + 1].s === '\n' ? this.strs[i + 2] : this.strs[i + 1]) : undefined
		// let nextFive = (i) => {
		// 	let givi = []
		// 	while(givi.length !== 5 && i < strs.length) { // && i !== this.strs.length
		// 		if (strs[i + 1].s !== '\n')
		// 			givi.push(strs[i++ + 1])
		// 		else
		// 			i++
		// 		// log(givi.length, strs[i++])
		// 	}
		// 	return givi
		// }
	
		// let next = (i) => {
		// 	let p = this.strs[i - 1].s === '\n' ? this.strs[i - 2] : this.strs[i - 1]
		// 	return p
		// }
		//log(strs)
		
		
		this.checkComponentName(strs[0].s)
		this.checkFirstLastBraces()
		this.componentName = strs[0].s
		strs.splice(0, 2)
		strs.splice(strs.length - 1, 1)
		// log(strs)

		let funcs = [] // TODO
		let childs = []
		let slots = [] // done
		let newProps = [] // done
		let chProps = [] // done
		for(let i = 0; i !== strs.length; ++i) {
			let pprev = strs[i - 2], prev = strs[i - 1], str = strs[i], next = strs[i + 1], nnext = strs[i + 2], nnnext = strs[i + 3]

			if (str.s === ':') {
				if (pprev.s === 'prop') { // if new prop with value
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
					newProps.push({name: next.s, type: prev.s, value})
				}
			}

			if (str.s === 'prop' && nnext.s !== ':') {
				this.checkVar(nnext, next)
				newProps.push({name: nnext.s, type: next.s, value: ''})
			}

			if (pprev && pprev.s !== 'prop' && str.s === ':') {
				if (next.s.substr(0, 2) === 'on') {
					slots.push({name: next.s, value: nnext.s})
				} else if (next.s[next.s.length - 1] === ')') {
					//log('this is function')
				} else { // change parent properties // TODO: check '.'
					chProps.push({name: next.s, value: nnext.s})
				}
			}
		}

		//log(strs)
		//log(chProps)

		// return
		// let g = 0

		// let b = {func: false, openBrace: false}
		// let braces = 0
		
		// let funcs = []

		// let mode = {prop: false, reset: function() { this.prop = false }}

		// for(let i = (strs[2].s === '\n' ? 3 : 2); i !== strs.length; ++i) {
		// 	if(strs[i].s === '\n' || strs[i].func) continue
		// 	let str = strs[i]
		// 	//log(next(i))

		// 	if(str.s === 'prop' || str.s === 'property') {
		// 		mode.prop = true
		// 		props.push([])
		// 		let next5 = nextFive(i)
		// 		// log(str.s, next(i + 1).s, next(i + 2).s, next(i + 3).s)
		// 		let n = next5[0]
		// 		if (varTypes.indexOf(n.s) !== -1)
		// 			props[props.length - 1].type = n.s
		// 		else
		// 			this.logError(11, n.l, n.c - 1, n.s.length)
		// 		props[props.length - 1].name = next5[1].s
		// 		if (next5[1].s[next5[1].s.length - 1] === ':' || next5[2].s[0] === ':')
		// 			log(next5[1].s, next5[2].s)

		// 	} //else {
		// 		// mode.reset()
		// 	// }
		// }

		// log(strs)
		// log(props)

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
		if (varTypes.indexOf(type.s) === -1)
			this.logError(11, type.l, type.c - 1, type.s.length)
		if (varTypes.indexOf(name.s) !== -1 ||
			varDisableNames.indexOf(name.s) !== -1)
				this.logError(8, name.l, name.c - 2)
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
script.load('app/app.dqs')


				// if (c === 1 && str.s !== '{')
				// 	throw this.logError(2, strs[0][0].l, strs[0][0].c + strs[0][0].s.length)
				// log(c, strs.length, str.s, c === strs.length - 1)
				// if (c === strs.length - 1 && str.s !== '}') {
				// 	log(c, str)
				// 	throw this.logError(3, str.l, str.c + str.s.length)
				// }

//Timer.singleShot(10000, function() {log(script)})