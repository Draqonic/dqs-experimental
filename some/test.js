// TODO: id, on signal

'use strict';

const log = console.log
const warn = console.warn
const error = console.error
const debug = console.debug
const print = log
const DS = require('./DS')
const DSObject = require('./DSObject')
const tr = (text) => { return DS.tr(text) }
const forceTr = (text, locale) => { return DS.forceTr(text, locale) }

class Timer {
	static singleShot(interval, func) {
		setTimeout(func, interval)
	}
}

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
		})
		// onCompleted
	}
}

const item = new Item()
item.id = 'obj'
obj.foo = -15
log(obj)

//Timer.singleShot(10000, function(){})
