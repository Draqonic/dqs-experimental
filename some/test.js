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

class Base extends EventEmitter {
	constructor() {
		super()
		this.parent = null
		this._binds = []
		this.children = []
		this.addProperies()
	}

	addProperies() {
	}

	addProperty(prop, value) {
		dg('New property:', prop);
		const change = prop + 'Change';
		const propName = '_' + prop
		Object.defineProperty(this, prop, {
			get: function() {
				return this[propName];
			},
			set: function(value) {
				if (this[propName] === value) return
				this[propName] = value;
				if (this[change])
					this[change](value);
				this.emit(change + 'd');
				//console.log('emit', change + 'd')
				//log('set', change)
			}
		});
		if (value) this[propName] = value

		//this.addListener(change, function(stream) { console.log('ON1!', stream) })
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
=========================================================


class Item extends Base {
	constructor() {
		super()
	}

	addProperies() {
		if (Base.prototype.addProperies)
			Base.prototype.addProperies.call(this)

		this.addProperty('bar')
		this.addProperty('q1', 5)
		this.addProperty('q2', 10)
		this.addProperty('q')
	}

	//fooChange(value) {
	//	if (Base.prototype.fooChange) Base.prototype.fooChange.call(this, value)
	//	log('Foo changed 2:', value)
	//}
	
	//barChange(value) {
	//	if (Base.prototype.barChange) Base.prototype.barChange.call(this, value)
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
