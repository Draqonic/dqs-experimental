const log = console.log
const warn = console.warn
const error = console.error
const debug = console.debug
const print = log
const EventEmitter = require('./Event')

class DSObject extends EventEmitter {
	constructor() {
		super()
		this.parent = null
		this.binds = []
		this.signals = []
		this.children = []
		//this.propert = Object.assign({}, DSObject.prototype.properties)
		// log(this.properties)
		this.properties = {}
		// for )
	
		// for (let key in DSObject.prototype.properties) {
		// 	this.properties[key] = Object.assign({}, DSObject.prototype.properties[key])
		// }
	}

	props(properties) {
		for(const property of properties) {
			this.prop(property[0], property[1], property[2])
		}
	}

	static prop(property, type, val, target) {
		if (!type) type = 'any';
		if (!this.prototype.properties) this.prototype.properties = {}
		let prop = this.prototype.properties
	
		if(property in prop) {
			error(`Error: Property '${property}' already exists`);
			return;
		}
	
		prop[property] = { type: type, value: undefined }
		const change = `${property}Change`;
	
		Object.defineProperty(this.prototype, property, {
			get: function() { return this.getProp(property) },
			set: function(value) { this.setProp(property, value) }
		});
	
		Object.defineProperty(this.prototype, change, {
			value: function() {
				this.emit(change, prop.value, prop.value)
			},
			writable: false
		});
	
		// this.prototype[change].Name = change;
		// this.prototype[change].connect = function(slot) {
		// 	if (!slot) {
		// 		error(`Error: Undefined slot for signal '${change}'`);
		// 		return;
		// 	}
		// 	this.connect(change, slot.Name ? slot.Name : slot);
		// }.bind(this)
	
		switch(type) {
			case 'int': val = parseInt(val) ? parseInt(val) : 0; break;
			case 'number': val = parseFloat(val) ? parseFloat(val) : 0.0; break;
			case 'string': val = String(val); break;
			case 'bool': val = !!val; break;
		}
		// log(this)
		this.prototype.properties[property].value = val
	
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

	setId(id) {
		if (this.id) return error('Error: id is already set for this object')
		this.id = id;
		if (typeof window !== 'undefined') {
			if (window[id]) { error('Error: id dublicate'); return }
			window[id] = this
		}
		else if (typeof global !== 'undefined') {
			if (global[id]) { error('Error: id dublicate'); return }
			global[id] = this
		}
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

	getProp(property) {
		log(DSObject.prototype.properties[property])
		let prop = property in this.properties ? this.properties[property] : DSObject.prototype.properties[property].value
		return prop
	}

	setProp(property, value) {
		const change = `${property}Change`;
		if (!this.properties[property])
			this.properties[property] = DSObject.prototype.properties[property].value
		const type = DSObject.prototype.properties[property].type

		let prop = this.properties[property]
		switch(type) {
			case 'int': value = parseInt(value) ? parseInt(value) : 0; break;
			case 'number': value = parseFloat(value) ? parseFloat(value) : 0.0; break;
			case 'string': value = String(value); break;
			case 'bool': value = !!value; break;
		}

		if (prop === value)
			return;

		let oldValue = prop;
		this.properties[property] = value;
		this.emit(change, value, oldValue);
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

module.exports = DSObject