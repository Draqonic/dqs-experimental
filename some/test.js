// TODO: id, on signal

'use strict';

const log = console.log
const warn = console.warn
const error = console.error
const debug = console.debug
const print = log
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
		this.binds = []
		this.signals = []
		this.child = []
		this.properties = {}
	}

	props(properties) {
		for(const property of properties) {
			this.prop(property[0], property[1], property[2])
		}
	}

	prop(property, type, val) {
		if (!type)
			type = 'any';

		if(property in this.properties) {
			error(`Error: Property '${property}' already exists`);
			return;
		}

		this.properties[property] = { type: type, value: undefined }
		let prop = this.properties[property];
		const change = `${property}Change`;

		Object.defineProperty(this, property, {
			get: function() {
				return prop.value;
			},
			set: function(value) {
				switch(prop.type) {
					case 'int': value = parseInt(value) ? parseInt(value) : 0; break;
					case 'number': value = parseFloat(value) ? parseFloat(value) : 0.0; break;
					case 'string': value = String(value); break;
					case 'bool': value = !!value; break;
				}

				if (prop.value === value)
					return;

				let oldValue = prop.value;
				prop.value = value;
				this.emit(change, prop.value, oldValue);
			}
		});

		Object.defineProperty(this, change, {
			value: function() { this.emit(change, prop.value, prop.value) },
			writable: false
		});

		this[change].Name = change;
		this[change].connect = function(slot) {
			if (!slot) {
				error(`Error: Undefined slot for signal '${change}'`);
				return;
			}
			this.connect(change, slot.Name ? slot.Name : slot);
		}.bind(this)

		switch(type) {
			case 'int': val = parseInt(val) ? parseInt(val) : 0; break;
			case 'number': val = parseFloat(val) ? parseFloat(val) : 0.0; break;
			case 'string': val = String(val); break;
			case 'bool': val = !!val; break;
		}
		prop.value = val

		//log(`New property: ${property} (${type})`, val ? `= ${val}` : '');
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

			for(const signals of this.signals) {
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
		this.signals.push({signal, slot, func})

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

	get id() { return this.properties.id ? this.properties.id.value : undefined }
	set id(id) {
		if (this.properties.id) return error('Error: id is already set for this object')
		this.properties.id = {type: 'id', value: id};
		if (typeof window !== 'undefined')
			window[id] = this
		else if (typeof global !== 'undefined')
			global[id] = this
	}

	bind(prop, upd, arr) {
		let updater = function() { this[prop] = upd.bind(this)() }.bind(this)

		for(let i = 0; i !== arr.length; i += 2) {
			let eventName = arr[i + 1] + 'Change'
			arr[i].on(eventName, updater)
			this.binds.push({prop, updater, eventName})
		}

		updater()
	}

	unbind(prop) {
		let binds = this.binds
		for(let i = 0; i !== binds.length; ++i) {
			if (binds[i]['prop'] === prop)
				this.removeListener(binds[i]['eventName'], binds[i]['updater'])
		}
	}
}
//if (DSObject.prototype.addProperies)
	//DSObject.prototype.addProperies.call(this)

class Item extends DSObject {
    constructor() {
		super()

        this.props([['her', 'int', 100], ['reg', 'any', /\s+/g], ['privet', 'string', 'hihihi'], ['iint', 'int', 111], ['foo', 'int', 6], ['sss', 'any'], ['bar', 'int'], ['baz', 'number'], ['bak', 'any', [ 34, 323,{hi: 555, buy: 10},342]], ['kek', 'any'], ])
		this.bind('bar', function() { return 10 + this.foo }, [this, 'foo'])
		this.bind('kek', function() { return 'KEK' + this.bar }, [this, 'foo'])
		this.bind('baz', function() { return this.foo }, [this, 'foo'])

		// this.updateBinds() обновление всех, исходя из зависимостей, detect bind loop

		this.onChange('bar', function(value, old) {
			log(`bar = ${value} (old: ${old})`)
			//this.her = 1111
		})
		// onCompleted
	}
}

// return
const item = new Item()
item.id = 'obj'
obj.foo = -15
log(obj)
// obj.p = '5OLD'

// obj.onChange('p', function(value, old) { console.log('p', value, old) })

// obj.signal('messageReceived')

// obj.sendToPost = function(person, notice) {
// 	console.log("Sending to post: " + person + ", " + notice)
// }
// obj.sendToTelegraph = function(person, notice) {
// 	console.log("Sending to telegraph: " + person + ", " + notice)
// }
// obj.sendToEmail = function(person, notice) {
// 	console.log(tr("Sending to email: ") + person + ", " + notice)
// }

// obj.messageReceived.connect(test.sendToPost)
// obj.messageReceived.connect(test.sendToTelegraph)
// obj.messageReceived.connect(test.sendToEmail)
// obj.messageReceived.connect((name, message) => { log(`Пашёл нах, ${name}, со своим ${message}!`)} )
// obj.pChange.connect(test.messageReceived)

// test.p = '5NEW'
// obj.p = '6NEW'

// obj.messageReceived('Tom', 'Happy Birthday')

//Timer.singleShot(10000, function(){})
