// TODO: id, on signal

'use strict';

const log = console.log
const warn = console.warn
const error = console.error
const debug = console.debug
const print = log
const { DS, DSObject } = require('./DSObject')
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

        // this.props([['her', 'int', 100], ['reg', 'any', /\s+/g], ['privet', 'string', 'hihihi'], ['iint', 'int', 111], ['foo', 'int', 6], ['sss', 'any'], ['bar', 'int'], ['baz', 'number'], ['bak', 'any', [ 34, 323,{hi: 555, buy: 10},342]], ['kek', 'any'], ])
		// this.bind('bar', function() { return 10 + this.foo }, [this, 'foo'])
		// this.bind('kek', function() { return 'KEK' + this.bar }, [this, 'foo'])
		// this.bind('baz', function() { return this.foo }, [this, 'foo'])

		// this.updateBinds() обновление всех, исходя из зависимостей, detect bind loop

		// this.onChange('bar', function(value, old) {
			// log(`bar = ${value} (old: ${old})`)
		// })
		// onCompleted
	}
}



// class Obj {

// }
// log(Obj.prototype)
// Object.defineProperty(Obj.prototype, 's', {
	// value: 5
// });
// let obj = new Obj
// log(obj.s)
// function Obj() {
// };
// for(let i = 0; i !== 1000; ++i)
// DSObject.prop('hello', 'int', 4, DSObject.prototype)

// // for(let i = 0; i !== 10000; ++i) {
	// let obj = new DSObject()
	// let obj2 = new DSObject()
	// obj.hello = 1
	// obj.hello = 2
// 	// obj.hello = 3
// 	// obj.hello = 4
	
// 	obj.hello = 5
	// obj2.hello = 6
// 	obj.setId('qw')
// 	obj2.setId('we')!!!
// obj.hello = 111111
// obj2.hello = 222222
// 	log(obj.hello)
// 	log(obj2.hello)
// !!!!
// 	log(obj)
// 	// obj2.hello = 6
// 	// log(obj.binds)
// 	// log(this.properties)
// 	// log(qw)
// 	// log(we) 
// 	// log(obj.hello)
	
// 	// log(obj2.hello)
// 	// obj.prop()
// // log(obj.helloChange.Name)
// // obj.helloChange()
// // }
// log('end')

// DSObject.prop('hello', 'any', 500)
// DSObject.onChange('hello', function(_new, old) { log('!', _new, old)})

DSObject.signal('read')
// DSObject.on('read', function() { log('>>>>', this.red)})
// DSObject.on('read', function(name) { log('hi', name)} )
DSObject.property('red', 'int')
DSObject.property('black', 'int')
DSObject.property('kek', 'string')


// obj1.red = 555
let kek = () => {obj1.red++}
// for(let i = 0; i != 500000; ++i)
// obj1.on('read', kek)
// log(obj1.red)
// obj1.emit('read')
// console.time(1)
// obj1.read('Mark')
// console.timeEnd(1)
//var kek = 10
// obj1.autoBind('red', function() {
// 	return  5 + this . black + this .black + this. black
// })
// obj1.kek = '111'
// obj1.bind('red', function() {
// 	let marmelad = 1111
// 	for(let i = 0; i !== 50; ++i)
// 		marmelad++
// 	return marmelad + this.black * 10
// })
// obj1.red = 50
class Rectangle extends DSObject {

}
class Obo extends DSObject {

}

Obo.property('one', 'int', 5)
Obo.property('qqq', 'int', 5)
Obo.property('sss', 'int', 5)
Obo.change('sss', (value, old) => {log('obo.sss', value, old)})
Rectangle.property('two', 'int', 25)
Rectangle.change('two', (value, old) => {log(value, old)})


let obo = new Obo
let rect = new Rectangle

rect.bind('two', function() { return obo.one * obo.qqq * obo.sss }, obo, 'one', obo, 'qqq', obo, 'sss')

// obo.one = 10
// 
rect.two = 125
obo.one = 2011
obo.one = 303

// rect.unbind('two')

obo.one = 11222

// log(obo.signals)
// log(rect.binds)


// log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n')
return
// obj1.bind('red', up, obj1, 'black' )

// obj1.black = 15
// log(obj1.red)
// obj1.black = 20
// log(obj1.red)

// Timer.singleShot(1000000, function(){})
// obj1.red = 10
// let obj2 = new DSObject()
// let obj3 = new DSObject()
// obj1.setId('ob1')
// obj2.setId('ob2')
// obj3.setId('ob2')
// DSObject.prop('hello', 'any', 500)

// ob1.hello = 10
// log(ob1.hello, ob2.hello)
// ob1.hello = 11
// ob2.hello = 55
// log(ob1.hello, ob2.hello)
// ob2.hello = 66

// obj1.read.connect(obj1.rad)
// obj1.on('redChange', (n, o) => log('hi', n, o))
// obj1.redChange()
// obj1.red = 5
// obj1.signal('read', () => log('hi'))
// obj1.read()












return

DSObject.prop('jfjfjfjjf', 'any', 5000)
log('>', obj1.jfjfjfjjf)

// for(let j = 0; j !== 20; ++j)
// DSObject.prop('kek' + j, 'int', 10)

Item.prop('jfjfjfjjf', 'any', 5000)
const item = new Item()

log('item', item.jfjfjfjjf)


return
for(let i = 0; i !== 10000; ++i) {
	let item = new DSObject()
	// item.onChange('hello', function(_new, old) { log('!', _new, old)})
	// item.kek5 = i
	item.setId('i' + i)
}
// i555.kek = 222
// log(i555)
// i555.kekChange()
setTimeout(function() {}, 5000000)

//Timer.singleShot(10000, function(){})
