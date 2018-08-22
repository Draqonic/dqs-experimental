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

function logError(error, file, line, column, contents) {
	let errorMessage = `E${error} in ${file}`

	if (line)
		errorMessage += `:${line}`
	if (column)
		errorMessage += `:${column}`
	errorMessage += `: ${errorText[error]}`
	//if (str)
	//	errorMessage += `\n'${str}'`
	
	err(errorMessage)
	let currentStr = contents.split(/[\n]/)[line - 1]
	err(currentStr)
	err(Array(column + 1).join(' ') + '^')
	
	err({version: '0.0.1', error, errorText: errorText[error], file, line, column, str: currentStr.replace(/\r/, '')})

	
	return false
}

let currentName = 'Item.qml'
let orig = "              \n         \n      Base	// крутой класс\n	  { \n\n  onBarChange : { if (value === 15) console.log ( function(value) { console.log(value) } (value)  } \n       \n\n            \n\n                            \n    property var foo: 6\n\n\n\n  onFooChange: console.log(value) \n        function hello() {}\n       property var bar: 15\n\n\n\n \n     property var baz: foo  ; property   var  kek: 'KEK'             +  bar\n    \n    }"

class DranoqLangFileParser {
	
}

class DranoqLang {
	constructor() {
		log('DranoqScript v0.0.1');
	}

	load(fileOrStr, isStr = false) {
		if (isStr) {
			this.work('string', fileOrStr);
		} else {
			const fs = require('fs');
			fs.readFile(fileOrStr, 'utf8', (error, contents) =>
				this.work(fileOrStr, contents)
			);
		}
 
		return true;
	}

	work(fName, contents) {
		let parentName
		//let orig_split = orig.split('\n')
		//let q = []

		/*
		for(const orig_line of orig_split) {
			line++;
			for(const str of orig_line.split(/[\s;]/)) {
				if (!str) continue
				q.push({line, str})
			}
		}
		*/
		// temp
		let gggg = 0
		
		// TODO: copy functions, slots, ignore comments
		let line = 1
		let column = 1
		let isSpace = false
		let strs = []
		let strTemp = ''
		let lineComment = false
		let globalComment = false
		let funcBlock = false
		let cBraces = 0
		let lets = []
		
		let expProp = {type: false, name: false, val: false, colon: false}

		for(let i = 0; i !== contents.length; ++i) {
			let ch = contents[i]
			
			if (ch === '\n' /*|| ch === '\r'*/) {
				line++
				lineComment = false
				column = 1
			} else column++

			if (ch === '/') {
				if (contents[i + 1] === '/') {
					lineComment = true
					i++
				} else if (contents[i + 1] === '*') {
					globalComment = true
				} else {
					if (contents[i - 1] === '*') { globalComment = false; continue; }
						else
					return logError(4, fName, line, column, contents)
				}
			}
			
			if (lineComment || globalComment) continue
			
			if ([' ', '\t', '\n', '\r', ':'].indexOf(ch) !== -1) {
				isSpace = true
				if (!strTemp) continue
				//log(expProp)

				if (expProp.val) {
					lets[lets.length - 1].value.push(strTemp)
					
					//log(strTemp.indexOf(';') !== - 1, strTemp.indexOf('\n') !== - 1)
					
					if (ch === ';' || ch === '\n')
						expProp.val = false
				}

				if (expProp.name) {
					for(let j = 0; j !== lets.length; ++j) if (lets[j].name === strTemp) return logError(6, fName, line, column, contents)
					if(strTemp[0] !== strTemp[0].toLowerCase()) return logError(5, fName, line, column, contents)
					lets[lets.length - 1].name = strTemp
					expProp.name = false
					expProp.colon = true
				}
				//log(ch, expProp.colon, ch === ':')
				
				if (expProp.colon && ch === ':')
					expProp.val = true
				else
					expProp.colon = false

				if (expProp.type) {
					lets[lets.length - 1].type = strTemp
					expProp.type = false
					expProp.name = true
				}
				
				if (strTemp === 'property' || strTemp === 'prop' || strTemp === 'let') {
					lets.push({name: '', type: '', value: []})
					expProp.type = true
				}

				strs.push({str: strTemp, line, column: column - strTemp.length - 1})
				strTemp = ''
			} else {
				if (ch === ';' || ch === '\n' || ch === '}')
					expProp.val = false

				isSpace = false
				strTemp += ch
			}
			
			//if (gggg++ > 10) break

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

let lang = new DranoqLang
lang.load('test.dqs')
//lang.work('Item.qml', orig)
//log(orig)
//log('Done')