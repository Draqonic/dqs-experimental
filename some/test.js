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
		this.on(`${prop}Change`, func)
	}

	signal(name, func) {
		Object.defineProperty(this, name, {
			value: function(...values) { this.emit(name, ...values) },
			writable: false
		});
		this.on(name, func)
	}

	addChild(el) {
		if (this.children.indexOf(el))
			this.children.push(el)
		el.parent = this
	}

	get id() { return this._id }
	set id(id) {
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
		log('some logs')
	}
}

// return
const item = new Item()
item.id = 'test'
//item.herChange()
log(test.her)

// item.read(1, 2, 3)
// console.log(item.onBarChange.toString())

test.her = 500
// log(item)
test.prop('s', 'int')
test.prop('s1', 'int')
test.prop('s2', 'int')
test.bind('s', function() { return this.s1 + this.s2 }, [test, 's1', test, 's2'] )
test.onChange('s', (value) => console.log(value))
// test.onChange('s2', () => this.s = this.s1 + this.s2)
test._s1 = 2
test.s2 = 3

test.signal('rock', function(q, w, e, aa, bb, cc, dd) { console.log(`i'm rock man`, e, w, q, aa, bb, cc, dd)})
test.rock(1, 2, 3, 5, 6, 7, 3, 2, 1)
// log(item.kek)
//Timer.singleShot(10000, function(){})
// item._reg = /\s+/g

let q = function(value) {
	return !!value
}
