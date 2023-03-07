var Model=require('po/Model')
var Callback=require('po/Callback')
var storage=window.localStorage

var cache = {
	length: function(){
		return storage.length
	},
	key: function(index){
		return storage.key(index)
	},
	get: function(key){
		if (!key) return
		return storage.getItem(key)
	},
	set: function(key, value){
		if (!key) return
		return storage.setItem(key, value)
	},
	remove: function(key){
		if (!key) return
		return storage.removeItem(key)
	},
	clear: function(name){
		if (!name) return storage.clear()
		for(var i=0,k; (k=storage.key(i)); i++){
			if (0 !== k.indexOf(name)) continue
			storage.removeItem(k)
		}
	}
}

function encodeCacheKey(id){
	if (!this.name) return
	return this.name + ':' + (id || '0')
}

function decodeCacheKey(key){
	var arr = key.split(':')
	if (arr[0] !== this.name) return
	return arr
}

function populate(coll, id, obj){
	var index = coll.modelIndex
	if (-1 === index.indexOf(id)){
		index.push(id)
		index.sort()
	}
	var model = coll.models[id] = Model(obj)
	model.callback.on('*', proxy, [coll, id])
	return model
}
function proxy(){
	var coll = this[0]
	var id = this[1]
	coll.callback.trigger('update', coll, id)
	var obj=coll.get(id)
	coll.cache && coll.cache.set(coll.encodeCacheKey(id), JSON.stringify(obj))
}
function reload(coll){
	var name = coll.name
	var cache = coll.cache
	if (!name || !cache) return
	for(var i=0,key,json,obj; (key=cache.key(i)); i++){
		if (!coll.decodeCacheKey(key)) continue
		try{
			json=cache.get(key)
			if (!json) continue
			obj=JSON.parse(json)
		} catch(ex){
			cache.remove(key)
			continue
		}
		set(coll, obj)
	}
}
function set(coll,obj,insertOnly){
	if (!obj) return
	var id=obj[coll.idAttr]
	var evt = 'add'
	var model=coll.models[id]
	if (model){
		if (insertOnly) return
		evt = 'update'
	}
	model = populate(coll, id, obj)
	coll.callback.trigger(evt,coll,id)
	coll.cache && coll.cache.set(coll.encodeCacheKey(id), JSON.stringify(obj))
	return model
}
function get(coll,id){
	var model=coll.models[id]
	if (model) return model
	var json=coll.cache && coll.cache.get(coll.encodeCacheKey(id))
	if (!json) return
	try {
		return populate(coll, id, JSON.parse(json))
	} catch (ex) {
		return
	}
}
function remove(coll,id){
	if (coll.models[id]){
		var idx=coll.modelIndex.indexOf(id)
		if (~idx){
			var model=coll.models[id]
			coll.callback.trigger('delete',coll,id)
			coll.modelIndex.splice(idx,1)
		}
		coll.models[id] = void 0
	}

	coll.cache && coll.cache.remove(coll.encodeCacheKey(id))
}
function clear(){
	this.modelIndex=[]
	this.models={}
	this.callback.trigger('clear')
	this.cache && this.cache.clear(this.encodeCacheKey())
}

function Collection(seed, name, opt){
	opt = opt || {}
	this.name = name
	this.idAttr = opt.idAttr || 'id'
	this.modelIndex = []
	this.models = {}
	this.callback = new Callback

	this.init.apply(this, Array.prototype.slice.call(arguments, 3))

	reload(this)
	this.set(seed, 1)

	this.ready()
}

Collection.prototype={
	// to be overriden
	init:function(spec){},
	fini:function(){},
	ready:function(){},

	cache: cache,
	encodeCacheKey: encodeCacheKey,
	decodeCacheKey: decodeCacheKey,

	set:function(model, insertOnly){
		if (!Array.isArray(model)) return set(this, model, insertOnly)
		for (var i = 0, l = model.length; i < l; i++){
			set(this, model[i], insertOnly)
		}
	},
	get:function(id){
		return get(this,id)
	},
	remove:function(id){
		return remove(this, id)
	},
	clear:clear,
	// range() // get all cache
	// range([1,4,89]) // get specific items, params are id
	// range(1,100) // pagination, params are index instead of id
	range:function(list){
		var remained=[]
		var models=[]
		var model
		var i, l, id
		switch(arguments.length){
		case 2:
			for(i=arguments[0],l=arguments[1]; i<=l; i++){
				model=get(this,this.modelIndex[i])
				if (model) models.push(model)
				else remained.push(i)
			}
			break
		case 1:
			for(i=0; (id=list[i]); i++){
				model=get(this,id)
				if (model) models.push(model)
				else remained.push(id)
			}
			break
		case 0:
			list = this.modelIndex

			for(i=0; (id=list[i]); i++){
				models.push(get(this,id))
			}
			break
		default:
			return
		}
		return [models, remained]
	},
	filter: function(cb){
		var list = this.modelIndex
		var models = []
		for (var i = 0, model, id; (id = list[i]); i++){
			model = get(this, id)
			if (cb(model, i, id, this)) models.push(model)
		}
		return models
	},
	find: function(cb){
		var list = this.modelIndex
		var model
		for (var i = 0, id; (id = list[i]); i++){
			model = get(this, id)
			if (cb(model, i, id, this)) return model
		}
	},
	forEach: function(cb){
		var list = this.modelIndex
		for (var i = 0, id; (id = list[i]); i++){
			if (cb(get(this, id), i, id, this)) break
		}
	},
	sort: function(cb){
		if (!cb) return
		var coll = this
		this.modelIndex.sort(function(id1, id2){
			return cb(get(coll, id1), get(coll, id2))
		})
	},
	at: function(index){
		if (index < 0) index = this.modelIndex.length + index
		if (index >= this.modelIndex.length) index = index % this.modelIndex.length
		return get(this, this.modelIndex[index])
	},
	indexOf: function(key){
		return this.modelIndex.indexOf(key)
	},
	length: function(){
		return this.modelIndex.length
	}
}

return Collection
