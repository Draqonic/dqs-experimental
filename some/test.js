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

				switch(types[privProp]) { // ['int', 'number', 'string', 'bool', 'any', 'enum', 'lazy', 'const', 'BigInt']
					case 'int': value = parseInt(value); break;
					case 'number': value = parseFloat(value); break;
					case 'string': value = String(value); break;
					case 'bool': value = !!value; break;
				}
				this[privProp] = value; // TODO: convert
				//console.log(prop, types[privProp])


				// if (this[change])
				// 	this[change](value);

				//log(prop, 'change')
				this.emit(change, value, oldValue);
			}
		});

		Object.defineProperty(this, change, {
			value: function() { this.emit(change, this[privProp], this[privProp]) },
			writable: false
		});

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

		//this.addListener(change, function(stream) { console.log('ON1!', stream) })
	}

	onChange(prop, func) {
		this.on(`${prop}Change`, func)
	}

	signal(name, func) {
		Object.defineProperty(this, name, {
			value: function(...values) { this.emit('name', values) },
			writable: false
		});
		this.on(name, func)
	}

	addChild(el) {
		if (this.children.indexOf(el))
			this.children.push(el)
		el.parent = this
	}

	//fooChange(value) {
	//	console.log('Foo changed 1:', value)
	//	this.bar = 'lol'
	//}
	
	//fooSet(value) {
	//	log('Foo set', value)
	//}
	get id() { return this._id }
	set id(id) {
		this._id = id;
		if (typeof window !== 'undefined')
			window[id] = this
		else if (typeof global !== 'undefined')
			global[id] = this
	}

	//get foo() {
	//	if (fooGet)
	//		return fooGet()
	//	return this._foo
	//}
	//set foo(value) {
	//	if (this.fooSet) this.fooSet(value)
	//	if (this.fooChange) this.fooChange(value)
	//	this._foo = value
	//}

	//barChange(value) {
	//	log('Bar changed 1:', value)
	//}

	//get bar() {
	//	if (barGet)
	//		return barGet()
	//	return this._bar
	//}
	//set bar(value) {
	//	if (this.barChange) this.barChange(value)
	//	this._bar = value
	//}

	bind(prop, upd, arr) {
		for(let i = 0; i !== arr.length; i += 2) {
			let eventName = arr[i + 1] + 'Changed'
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
//=========================================================

/*
class Item extends DSObject {
	constructor() {
		super()
	}

	addProperies() {
		if (DSObject.prototype.addProperies)
			DSObject.prototype.addProperies.call(this)

		this.addProperty('bar')
		this.addProperty('q1', 5)
		this.addProperty('q2', 10)
		this.addProperty('q')
	}

	//fooChange(value) {
	//	if (DSObject.prototype.fooChange) DSObject.prototype.fooChange.call(this, value) super.fooChange
	//	log('Foo changed 2:', value)
	//}
	
	//barChange(value) {
	//	if (DSObject.prototype.barChange) DSObject.prototype.barChange.call(this, value)
	//	log('Bar changed 2:', value)
	//	this.signal()
	//}
}

class Widget extends Item {
	addProperies() {
		console.log(Object.getPrototypeOf(this.constructor).name)
		if (Item.prototype.addProperies)
			Item.prototype.addProperies.call(this)
	}
}

var obj = new Widget
obj.id = 'hello'
//obj.foo = 3
//let obj2 = new Item
//obj2.parent = obj
//obj2.parent.foo = 4

obj.qChange = function(value) { console.log('q =', value) }
obj.q1Change = function(value) { console.log('q1 =', value) }
obj.q2Change = function(value) { console.log('q2 =', value) }

//obj.q1 = 5
//obj.q2 = 10
//obj.qUpdate = function() { return this.q1 + this.q2 }

obj.bind('q', function() { return this.q1 + this.q2 }, [obj, 'q1', obj, 'q2'])

obj.q = obj.q1 + obj.q2

obj.q1 = 10
obj.q2 = 15

obj.unbind('q')
obj.bind('q', function() { return this.q1 * 50 }, [obj, 'q1'])

obj.q1 = 1
obj.q2 = 2



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

        this.props([['reg', 'any'], ['privet', 'string'], ['iint', 'int'], ['foo', 'int'], ['sss', 'any'], ['bar', 'int'], ['baz', 'number'], ['bak', 'any'], ['kek', 'any'], ])

		this._reg = /\s+/g
		this._privet = 'hihihi'
		this._foo = 6
		this._bar = 5 * 10+this.foo
		this._baz = foo
		this._bak = [ 34, 323,{hi: 555, buy: 10},342]
		this._kek = 'KEK' + this.bar
		this._her = 100
		this.onChange('her', function(value, old) {
			log('___________________________________Item', value, old)
			//this.her = 1111
		})
		log('some logs')
	}
}

return
const item = new Item()
item.id = 'test'
//item.herChange()
console.log(test.her)

// item.read(1, 2, 3)
// console.log(item.onBarChange.toString())

test.her = 500
// log(item)
test.prop('привет', 'string')
test.привет = "как дела?"
test.onChange('привет', (value) => console.log('kek', value))
test.привет = item.her

test.signal('rock', function(q, w, e, aa, bb, cc, dd) { console.log('i\'m rock man', e, w, q, aa, bb, cc, dd)})
test.rock(1, 2, 3, 5, 6, 7, 3, 2, 1)
// log(item.kek)
//Timer.singleShot(10000, function(){})
// item._reg = /\s+/g

let q = function(value) {
	return !!value
}
