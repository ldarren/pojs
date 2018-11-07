# pojs
backbone@next implemented with plain old javascript with minimal dependencies

# test
load `test/test.html` in browser, result is in console panel

# documentation
## Collection

### initialiazation `new Collection([data], [routes], [name], [network], [options])`
Collections are ordered sets of models.

### load `collection.add(models, cb)`
Add an array of raw object to the collection, firing an "add" event for each object added to collection as model
```
const coll = new Colection()
coll.add([{id: 1, value: 'a'}, {id: 2, value: 'b'}])
```

### list `collection.list([filter1], [filter2], cb)`
Get all models from a collection. only read from local storage if no filter1 and filter2 passed in

you can specified startId and lastId as filter1 and filter2, `list` will return an array models which id in (startId, lastId). `list` will trigger network call to upstream to get missing models in local storage
```javascript
collection.list(1, 100, () => {})
```

you can also specified array of need id as filter1, `list` will return an array models which id in filter1. `list` will trigger network call to upstream to get missing models in local storage
```javascript
collection.list(['dog', 'cat'], () => {})
```
