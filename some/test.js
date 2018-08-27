// TODO: id, on signal

'use strict';
const log = console.log
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

class DSObject {
	constructor() {
		// super()
		this.parent = null
		this._binds = []
		this.child = []
		this.properties = new EventEmitter()
		this.properties.types = {}
		//TODO this.beforeCreate() onCreate
		//this.addProperties()
		this.prop('her')
		this.properties.her = 1000

		// this.herChangedObject = function(value, old) {
		// 	log('___________________________________Object', value, old)
		// }
		this.onChange('her', function(value, old) {
			log('___________________________________Object', value, old)
		})

		//TODO onComplete
	}


	props(properties) {
		for(const property of properties) {
			this.prop(property[0], property[1])
		}
	}

	prop(prop, type) {
		dg('New property:', prop);
		if (!type) type = 'any'
		const change = prop + 'Change';
		const propName = prop
		const props = this.properties
		const types = this.properties.types
		Object.defineProperty(this, prop, {
			get: function() {
				return props[prop];
			},
			set: function(value) {
				if (props[prop] === value)
					return

				let oldValue = props[prop]
				props[prop] = value; // TODO: convert
				console.log(prop, types[prop])
				switch(types[prop]) { // ['int', 'number', 'string', 'bool', 'any', 'enum', 'lazy', 'const', 'BigInt']
					case 'int': val = parseInt(value); break;
					case 'number': val = parseFloat(+value); break;
					case 'string': val = String(value); break;
					case 'bool': val = !!value; break;
					//case 'BigInt': val = 0n; break; // only for Node.js
					case 'any': val = undefined; break;
				}	

				// if (props[change])
				// 	props[change](value);

				//log(prop, 'change')
				this.properties.emit(change, value, oldValue);
			}
		});

		Object.defineProperty(this, change, {
			value: function() { this.properties.emit(change, props[prop], props[prop]) },
			writable: false
		});

		let val
		switch(type) { // ['int', 'number', 'string', 'bool', 'any', 'enum', 'lazy', 'const', 'BigInt']
			case 'int': val = 0; break;
			case 'number': val = 0.0; break;
			case 'string': val = ''; break;
			case 'bool': val = false; break;
			//case 'BigInt': val = 0n; break; // only for Node.js
			case 'any': val = undefined; break;
		}
		props[prop] = val
		types[prop] = type

		//this.addListener(change, function(stream) { console.log('ON1!', stream) })
	}

	onChange(prop, func) {
		// if (func не функция)
		this.properties.on(prop + 'Change', func)
	}

	signal(name, func) {
		Object.defineProperty(this, name, {
			value: func,
			writable: false
		});
		this.properties.on(name, func)
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
	set id(id) { this._id = id; global.id = id }

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
			arr[i].properties.on(eventName, updater)
			this._binds.push({prop, updater, eventName})
		}
	}

	unbind(prop) {
		for(let i = 0; i !== this._binds.length; ++i) {
			if (this._binds[i]['prop'] === prop)
				this.properties.removeListener(this._binds[i]['eventName'], this._binds[i]['updater'])
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

*/
let foo = 111, bar = 'sss'

class Item extends DSObject {
    constructor() {
		super()
		
        this.props([['reg', 'any'], ['privet', 'string'], ['iint', 'int'], ['foo', 'int'], ['sss', 'any'], ['bar', 'int'], ['baz', 'number'], ['bak', 'any'], ['kek', 'any'], ])
		
		let props = this.properties
		props.reg = /\s+/g
		props.privet = 'hihihi'
		props.foo = 6
		props.bar = 5 * 10+this.foo
		props.baz = foo
		props.bak = [ 34, 323,{hi: 555, buy: 10},342]
		props.kek = 'KEK' + this.bar
		props.her = 100
		this.properties.on('_herChange', function(value, old) {
			log('___________________________________Item', value, old)
			this.her = 1111
		})
		log('some logs')
	}
}

const item = new Item()
item.herChange()
console.log(item.her)

// item.read(1, 2, 3)
// console.log(item.onBarChange.toString())

item.her = 500
log(item)
item.prop('привет', 'string')
item.привет = "как дела?"
item.onChange('привет', (value) => console.log('kek', value))
item.привет = item.her

item.signal('rock', function(q, w, e, aa, bb, cc, dd) { console.log('i\'m rock man', e, w, q, aa, bb, cc, dd)})
item.rock(1, 2, 3, 5, 6, 7, 3, 2, 1)
// log(item.kek)
//Timer.singleShot(10000, function(){})
// item._reg = /\s+/g

let q = function(value) {
	return !!value
}
console.time(1)
console.log(q(false))
console.timeEnd(1)

console.time(1)
console.log(q(144.3))
console.timeEnd(1)

console.time(1)
console.log(q('5привет'))
console.timeEnd(1)

item.privet = 1123
console.log(item.privet)