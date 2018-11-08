# pojs
backbone@next implemented with plain old javascript with minimal dependencies

# documentation
## Collection

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

# test
load `test/test.html` in browser, result is in console panel
