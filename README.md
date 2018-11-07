# pojs
backbone@next implemented with plain old javascript with minimal dependencies

# documentation
## Collection

### initialiazation
> new Collection([data], [routes], [name], [network], [options])

Collections are ordered sets of models.

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

# test
load `test/test.html` in browser, result is in console panel
