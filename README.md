# pojs
backbone@next implemented with plain old javascript with minimal dependencies

# documentation
## Callback
`Callback` is the event system in `pojs`. it is used for module-to-module or module-to-collection communication

## on
> Callback.on(event, callback, [context])

Bind a callback function to an object. The callback will be invoked whenever the event is fired. If you have a large number of different events on a page, the convention is to use colons to namespace them: "poll:start", or "change:selection".

## off
> Callback.off([event], [callback], [context])

Remove a previously-bound callback function from an object. If no context is specified, all of the versions of the callback with different contexts will be removed. If no callback is specified, all callbacks for the event will be removed. If no event is specified, callbacks for all events will be removed.

## trigger
> Callback.trigger(event, [*args])

Trigger callbacks for the given event. Subsequent arguments to trigger will be passed along to the event callbacks.

## Collection
purpose of collection
1) cache data on client side
2) network communication
3) communication channel between modules

### initialiazation
> new Collection([data], [routes], [name], [network], [options])

Collections are ordered sets of models.

#### override init function
Collection constructor only process the first two arguments (`data`, `routes`), addtional arguments are processed by `Collection.init` function.

the default init function
```javascript
init:function(name, network, opt){
	this.name = name
	this.network = network || this.network 
	opt = opt || {}
	this.idAttr = opt.idAttr || this.idAttr
	return opt.reload
}
```
return of `Collection.init` is a `Boolean`. if true, Collection will reload from local storage

`Collection.init` can be override by `extend` function
```javascript
// in customcollection.js
const Collection = require('po/collection')

Collection.extend({
	init:function(jwt){
		this.name = 'CustomColl'
		this.idAttr = '_key'
		this.network = {
			ajax: function(method,route,params,cb){
				if (!route) return cb(null,params)
				pico.ajax(method,route,params,{Authorization: 'Bearer' + jwt},function(err,state,res){
					if (4!==state) return
					if (err) return cb(err)
					try{var obj=JSON.parse(res)}
					catch(ex){return cb(ex)}
					cb(null,obj)
				})
			}
		}
		return true
	}
})

// in another.js
const CustomCollection = require('customcollection')

const coll = new Collection(null, {}, jwt); // name, network, opt arguments are no longer needed
```

#### override network function
if the default ajax function doesn't meet your requirement, for example you need addtional headers. you can override it by passing in a new network object

```javascript
// pico is already defined

function aclosure(jwt){
  const options = {
    headers: {
      Authorization: 'Bearer ' + jwt
    }
  }
  return {
    ajax(method, route, params, cb){
      if (!route) return cb(null,params)
      pico.ajax(method,route,params,options,function(err,state,res){
        if (4!==state) return
        if (err) return cb(err)
        try{var obj=JSON.parse(res)}
        catch(ex){return cb(ex)}
        cb(null,obj)
      })
    }
  }
}

const coll = new Collection(null, {}, 'example', aclosure(jwt));
```

#### events
`Collection` has [`Callback`](#callback) built in.
These are the events supported
1) add: when new model added to collection
2) update: when an existing model got updated
3) delete: when an existing model got deleted
4) clear: when the collection got cleared

Example
```javascript
// in amodule.js

// newModel will be trigger 2 times
function newModel(coll, id){
	// this === amodule instance
}

return {
	start(opt, coll){
		coll.on('add', newModel, this)
		coll.create({id: 1, value: 'a'}
		coll.create({id: 2, value: 'b'}
	}
}
```

### load 
> collection.add(models, cb)

Add an array of raw object to the collection, firing an "add" event for each object added to collection as model
```javascript
const coll = new Colection()
coll.add([{id: 1, value: 'a'}, {id: 2, value: 'b'}])
```

### list
> collection.list([filter1], [filter2], cb)

Get all models from a collection. only read from local storage if no filter1 and filter2 passed in

you can specified startId and lastId as filter1 and filter2, `list` will return an array models which id in (startId, lastId). `list` will trigger network call to upstream to get missing models in local storage
```javascript
collection.list(1, 100, () => {})
```

you can also specified array of need id as filter1, `list` will return an array models which id in filter1. `list` will trigger network call to upstream to get missing models in local storage
```javascript
collection.list(['dog', 'cat'], () => {})
```

## module
### extend a module
There are two ways to extend a module
1) use the `extend` built in method
2) use `inherit` keyword, it is synxtax sugar of `require` + `extend`
`inherit` is more convenient but `.extend` is more flexible it allow you to extend multiple objects in a file

Example:
```javascript
// CustomModule.js
const Module = require('po/module');

return Module.extend({
	start(opt, param1){
		Module.prototype.start.call(this, opt);
		
		// extra processing here
	}
});

// othermodule.js
const CustomModule = inherit('CustomModule')

return {
	start(opt, param1){
		CustomModule.prototype.start.call(this, opt, param1);
	}
}
```

### events
`Module` has [`Callback`](#callback) builtin to support event communication between modules

Example
```javascript
// module1.js
return {
	function onHello(data){
		console.log(data) // 'abc'
	}
	function onWorld(data){
		console.log(data) // 'def'
	}
	start(opt, mod2){
		mod2.callback.on('hello', onHello, this)
		this.callback.on('world', onWorld, this)
		mod2.callback.trigger('foo', 123)
		this.callback.trigger('bar', 123)
	}
}

// module2.js
return {
	function onFoo(data){
		console.log(data) // 123
	}
	function onBar(data){
		console.log(data) // 456
	}
	start(opt, mod1){
		mod1.callback.on('bar', onBar, this)
		this.callback.on('foo', onFoo, this)
		mod1.callback.trigger('world', 123)
		this.callback.trigger('hello', 456)
	}
}

```

# test
load `test/test.html` in browser, result is in console panel
