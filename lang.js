// TODO: dubl vars, props
// global braces count (indexOf)

const log = console.log
const warn = console.warning
const err = console.error
const deb = console.debug

const keyWords = ['property', 'function', '{', '}']
const varTypes = ['int', 'number', 'string', 'bool', 'var', 'symbol', 'RegExp', 'Component', 'BigInt']
const errorText = {
0: 'Global error',
1: 'Incorrent parent object name',
2: 'No opening \'{\' for Component',
3: 'No close \'{\' for Component'
}
const warnText = {
0: '[code style] Extra semicolon',
1: '[code style] Brace on a new line'
}

function logError(error, file, line, str) {
	let errorMessage = `E${error} in ${file}`

	if (line)
		errorMessage += `:${line}`
	errorMessage += `: ${errorText[error]}`
	if (str)
		errorMessage += `\n'${str}'`
	
	err(errorMessage)
}

let currentName = 'Item.qml'
let orig = "              \n         \n      Base		  { \n\n  onBarChange : { if (value === 15) console.log ( function(value) { console.log(value) } (value)  } \n       \n\n            \n\n                            \n    property var foo: 6\n\n\n\n  onFooChange: console.log(value) \n        function hello() {}\n       property var bar: 15\n\n\n\n \n     property var baz: foo  ; property   var  kek: 'KEK'             +  bar\n    \n    }"

class DranoqLang {
	
	constructor() {
		log('Dranoq Lang 0.0.1')
	}
	
	work(fName, text) {
		let parentName
		let orig_split = orig.split('\n')
		let line = 0
		let q = []

		for(const orig_line of orig_split) {
			//or = or.trim()
			//if (!or)
			//	continue;
			line++;
			for(const str of orig_line.split(/[\s;]/)) {
				if (!str) continue
				q.push({line, str})
			}
		}

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
lang.work('Item.qml', orig)