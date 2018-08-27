// TODO: id, on signal

'use strict';
const log = console.log
const print = log
const error = console.error
const debug = console.debug
const dg = console.debug

/*
Base {
	property var foo // number, bool, string
	property var bar
	
	onFooChange:
	onBarChange:
	onSignal:
}

Item {
	onFooChange:
	onBarChange:
	
	Item {
		onFooChange: parent.
	}
}
// const DranoqScript = require('DranoqScript')
// const app = new DranoqScript('main.qml')
// app.load()
*/
const EventEmitter = require('./Event')

class Timer {
	static singleShot(interval, func) {
		setTimeout(func, interval)
	}
}

class DSObject extends EventEmitter {
	constructor() {
		super()
		this.parent = null
		this._binds = []
		this._signals = []
		this.child = []
		this.types = {}
		//TODO onCreate

		//TODO onComplete
	}


	props(properties) {
		for(const property of properties) {
			this.prop(property[0], property[1])
		}
	}

	prop(prop, type) {
		//dg('New property:', prop);
		if (!type) type = 'any'
		
		const types = this.types
		const privProp = '_' + prop
		const change = prop + 'Change'

		Object.defineProperty(this, prop, {
			get: function() {
				return this[privProp];
			},
			set: function(value) {
				if (this[privProp] === value)
					return

				let oldValue = this[privProp]

				switch(types[privProp]) {
					case 'int': value = parseInt(value); break;
					case 'number': value = parseFloat(value); break;
					case 'string': value = String(value); break;
					case 'bool': value = !!value; break;
				}
				this[privProp] = value;
				this.emit(change, value, oldValue);
			}
		});

		Object.defineProperty(this, change, {
			value: function() { this.emit(change, this[privProp], this[privProp]) },
			writable: false
		});
		this[change].Name = change
		this[change].connect = function(slot) {
			if (!slot) {
				error(`Error: Undefined slot for signal '${change}'`)
				return
			}
			this.connect(change, slot.Name ? slot.Name : slot)
		}.bind(this)

		let val
		switch(type) {
			case 'int': val = 0; break;
			case 'number': val = 0.0; break;
			case 'string': val = ''; break;
			case 'bool': val = false; break;
			//case 'BigInt': val = 0n; break; // only for Node.js
			case 'any': val = undefined; break;
		}
		this[privProp] = val
		if (type !== 'any')
			types[prop] = type
	}

	onChange(prop, func) {
		if (!func) return error('Error: need function for onChange ' + prop)
		this.on(`${prop}Change`, func)
	}

	signal(name, func) {
		if (!func) func = function() {}
		Object.defineProperty(this, name, {
			value: function(...values) { this.emit(name, ...values) },
			writable: false
		});
		this[name].Name = name
		this[name].connect = function(slot) {
			if (!slot) {
				error(`Error: Undefined slot for signal '${name}'`)
				return
			}
			this.connect(name, slot.Name ? slot.Name : slot)
		}.bind(this)
		this.on(name, func)
	}

	connect(signal, slot) {
		if (typeof slot === 'string') {
			// TODO: check if signal or slot exists
			if (signal === slot) {
				error(`Error: Disable connect '${signal}' to '${signal}'.`)
				return false
			}

			for(const signals of this._signals) {
				if (signals.signal === slot && signals.slot === signal) {
					error(`Error: Disable connect '${slot}' to '${signal}', because '${signal}' already attached to '${slot}'.`)
					return false
				}
			}
		}

		let func
		if (typeof slot === 'function')
			func = slot
		else
			func = function(...values) { this[slot](...values) }
		this.on(signal, func)
		this._signals.push({signal, slot, func})

		return true
	}

	toString() {
		return this.constructor.name + ' {}'
	}

	addChild(el) {
		if (this.children.indexOf(el))
			this.children.push(el)
		el.parent = this
	}

	get id() { return this._id }
	set id(id) {
		if (this._id) return error('Error: id is already set for this object')
		this._id = id;
		if (typeof window !== 'undefined')
			window[id] = this
		else if (typeof global !== 'undefined')
			global[id] = this
	}

	bind(prop, upd, arr) {
		for(let i = 0; i !== arr.length; i += 2) {
			let eventName = arr[i + 1] + 'Change'
			let updater = function() { this[prop] = upd.bind(this)() }
			arr[i].on(eventName, updater)
			this._binds.push({prop, updater, eventName})
		}
	}

	unbind(prop) {
		for(let i = 0; i !== this._binds.length; ++i) {
			if (this._binds[i]['prop'] === prop)
				this.removeListener(this._binds[i]['eventName'], this._binds[i]['updater'])
		}
	}
}


		//if (DSObject.prototype.addProperies)
			//DSObject.prototype.addProperies.call(this)


//obj.bind('q', function() { return this.q1 + this.q2 }, [obj, 'q1', obj, 'q2'])

/*
class SomeButton extends DSObject {
	constructor() {
		super()

		this.prop('text', 'string')
		this._text = 'Text 1'
		this.onChange('text', (text) => console.log(1, text))
	}
}

class SomeLabel extends SomeButton {
	constructor() {
		super()

		this.text = 'Text 2'
		this.onChange('text', (text) => text = 5)
	}
}

let $$$mainObject = new DSObject
let $$$dfdfsgdsk4334 = new SomeLabel
$$$dfdfsgdsk4334.parent = $$$mainObject
$$$dfdfsgdsk4334.id = 'sb'
sb.text = "Text 3"
log(sb)
*/

class Item extends DSObject {
    constructor() {
		super()

        this.props([['her', 'int'], ['reg', 'any'], ['privet', 'string'], ['iint', 'int'], ['foo', 'int'], ['sss', 'any'], ['bar', 'int'], ['baz', 'number'], ['bak', 'any'], ['kek', 'any'], ])

		this._reg = /\s+/g
		this._privet = 'hihihi'
		this._foo = 6
		this._bar = 5 * 10+this.foo
		this._baz = this.foo
		this._bak = [ 34, 323,{hi: 555, buy: 10},342]
		this._kek = 'KEK' + this.bar
		this._her = 100
		this.onChange('her', function(value, old) {
			log('___________________________________Item', value, old)
			//this.her = 1111
		})
		// log('some logs')
	}

	sendToPisun(person, notice) {
		log('Sending to pisun: ' + person + ', ' + notice)
	}
}

// return
const item = new Item()
item.id = 'test'
item.prop('p', 'int')
test.p = 12
item.onChange('p', function(value, old) { console.log('p', value, old) })

test.signal('messageReceived')
test.signal('sendToPost', function(person, notice) {
	console.log("Sending to post: " + person + ", " + notice)
})
test.signal('sendToTelegraph', function(person, notice) {
	console.log("Sending to telegraph: " + person + ", " + notice)
})
test.signal('sendToEmail', function(person, notice) {
	console.log("Sending to email: " + person + ", " + notice)
})
test.messageReceived.connect(test.sendToPost)
test.messageReceived.connect(test.sendToTelegraph)
test.messageReceived.connect(test.sendToEmail)
test.messageReceived.connect(test.sendToPisun)
// test.messageReceived.connect(test.pChange())
// test.messageReceived.connect(function(name, message) { log(`Пашёл нахуй, ${name}, со своим ${message}!`)} )
test.pChange.connect(test.messageReceived)

test.p = 15

Timer.singleShot(1000000, function() {})

// test.messageReceived('Tom', 'Happy Birthday')

// test.pChange.connect(test.messageReceived)

// test.pChange()
// test.p = 10

// log(another)
// log(test)

//item.herChange()
// log(test.her)

// item.read(1, 2, 3)
// console.log(item.onBarChange.toString())

// test.her = 500
// log(item)
// test.prop('s', 'int')
// test.prop('s1', 'int')
// test.prop('s2', 'int')
// test.bind('s', function() { return this.s1 + this.s2 }, [test, 's1', test, 's2'] )
// test.onChange('s', (value) => console.log('s =', value))
// test.onChange('s2', () => this.s = this.s1 + this.s2)
// test._s1 = 2
// test.s2 = 3

// test.signal('rock', function(va, ol, e, aa, bb, cc, dd) { console.log(`i'm rock man`, va, ol, e, aa, bb, cc, dd)})
// test.rock(1, 2, 3, 5, 6, 7, 3, 2, 1)

// test.signal('kik', function(value) { log('kik', value, this.toString()) })
// test.connect('kik', 'rock')
// test.connect('sChange', 'kik')
// test.connect('kik', 'kik')
// test.kik(1, 2, 3, 4, 5, 6, 7, 8)
// test.sChange.connect(test.rock)
// test.rock.connect(test.kik)

// test.kik(1, 2)
// test.s = 1112

//Timer.singleShot(10000, function(){})

// class kek {
// 	constructor() {
// 		Object.defineProperty(this, 'piska', {
// 			// value: function(...values) { print(...values) },
// 			get: function() { return function(){} }
// 			//writable: false
// 		});
// 		// log(this.piska())
// 	}
// }

// function kek() {
	// kek.connect = function() { log('connect') }
	// log('emit')
// } 
// let kek = function() { console.log('emit')}
// kek.connect = function() { console.log('connect')}
// kek()

// var kik = new kek()
// kik.piska(1)
// print(kik.piska)