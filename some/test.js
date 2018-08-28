// TODO: id, on signal

'use strict';

const log = console.log
const print = log
const error = console.error
const debug = console.debug
const DS = require('./DS')
const EventEmitter = require('./Event')
const tr = (text) => { return DS.tr(text) }
const forceTr = (text, locale) => { return DS.forceTr(text, locale) }

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
	}

	props(properties) {
		for(const property of properties) {
			this.prop(property[0], property[1])
		}
	}

	prop(prop, type) {
		if (!type)
			type = 'any'
		log(`New property: ${prop} (${type})`)
		
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

				switch(types[prop]) {
					case 'int': value = parseInt(value) ? parseInt(value) : 0; break;
					case 'number': value = parseFloat(value) ? parseFloat(value) : 0.0; break;
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
test.prop('p', 'string')
test.p = 'OLD'

test.onChange('p', function(value, old) { console.log('p', value, old) })

test.signal('messageReceived')

test.sendToPost = function(person, notice) {
	console.log("Sending to post: " + person + ", " + notice)
}
test.sendToTelegraph = function(person, notice) {
	console.log("Sending to telegraph: " + person + ", " + notice)
}
test.sendToEmail = function(person, notice) {
	console.log(tr("Sending to email: ") + person + ", " + notice)
}

test.messageReceived.connect(test.sendToPost)
test.messageReceived.connect(test.sendToTelegraph)
test.messageReceived.connect(test.sendToEmail)
test.messageReceived.connect(test.sendToPisun)
test.messageReceived.connect((name, message) => { log(`Пашёл нах, ${name}, со своим ${message}!`)} )
test.pChange.connect(test.messageReceived)

test.p = 'NEW'

test.messageReceived('Tom', 'Happy Birthday')

//Timer.singleShot(10000, function(){})
