var pStr=require('pico/str')
var Model=require('po/Model')
var Callback=require('po/Callback')
var storage=window.localStorage
var dcb=__.dummyCB

var cache = {
	length: function(){
		return storage.length
	},
	key: function(index){
		var key = storage.key(index)
		if (key) return key.split(':')
	},
	get: function(name, id){
		if (!name) return
		return storage.getItem(name + ':' + id)
	},
	set: function(name, id, value){
		if (!name) return
		return storage.setItem(name + ':' + id, value)
	},
	remove: function(name, id){
		if (!name) return
		return storage.removeItem(name + ':' + id)
	},
	clear: function(name){
		//storage.clear()
		if (!name) return
		for(var i=0,k; (k=storage.key(i)); i++){
			if (0 !== k.indexOf(name)) continue
			storage.removeItem(k)
		}
	}
}

function parse(res, cb){
	try{
		var obj=JSON.parse(res)
	} catch(ex){
		return cb(ex)
	}
	cb(null,obj)
}

function ajax(method, route, params, cb, coll){
	if (!route) return cb(null,params)
	pico.ajax(method,route,params,null,function(err,state,res){
		if (4!==state) return
		if (err) return cb(err)
		coll.parse(res, cb)
	})
}

function compileRest(routes){
	var rest = []
	for (var i = 0, ks = Object.keys(routes), k; (k = ks[i]); i++){
		pStr.compileRest(routes[k], rest)
	}
	return rest
}
function buildRest(coll, route, params){
	return pStr.buildRest(route, coll.rest, Object.assign({}, params, coll.restParams), coll.relativePath)
}

function populate(coll, id, obj){
	var index = coll.modelIndex
	if (-1 === index.indexOf(id)){
		index.push(id)
		index.sort()
	}
	var model = coll.models[id] = Model(obj)
	model.callback.on('field.add', update, [coll, id])
	model.callback.on('field.update', update, [coll, id])
	model.callback.on('field.delete', update, [coll, id])
	return model
}
function reload(coll){
	var name = coll.name
	var cache = coll.cache
	if (!name || !cache) return
	for(var i=0,arr,json,obj; (arr=cache.key(i)); i++){
		if (arr[0] !== name) continue
		try{
			json=cache.get.apply(cache, arr)
			obj=JSON.parse(json)
		} catch(ex){
			cache.remove.apply(cache, arr)
			continue
		}
		populate(coll, obj[coll.idAttr], obj)
	}
}
function load(coll,models,idx,cb){
	if (models.length <= idx) return cb()
	coll.create(models[idx++],function(err){
		if (err) return cb(err)
		load(coll,models,idx,cb)
	})
}
function set(coll,obj){
	if (!obj) return
	var id=obj[coll.idAttr]
	var evt = 'add'
	var model=coll.models[id]
	if (model){
		evt = 'update'
	}
	model = populate(coll, id, obj)
	coll.callback.trigger(evt,coll,id)
	coll.cache.set(coll.name, id, JSON.stringify(obj))
	return model
}
function get(coll,id){
	var model=coll.models[id]
	if (model) return model
	var json=coll.cache.get(coll.name, id)
	if (!json) return
	try {
		return populate(coll, id, JSON.parse(json))
	} catch (ex) {
		return
	}
}
function update(){
	var coll = this[0]
	var id = this[1]
	var model = get(coll, id)
	coll.ajax('put', buildRest(coll, coll.routes.update, model), model, function(err,res){
		if (err) throw err
		coll.callback.trigger('update',coll,id)
		coll.cache.set(coll.name, id, JSON.stringify(model))
	}, coll)
}
function remove(coll,id){
	if (coll.models[id]){
		var idx=coll.modelIndex.indexOf(id)
		if (~idx){
			var model=coll.models[id]
			model.callback.trigger('delete',model,id)
			coll.callback.trigger('delete',coll,id)
			coll.modelIndex.splice(idx,1)
		}
		coll.models[id] = void 0
	}

	coll.cache.remove(coll.name, id)
}
function clear(){
	this.modelIndex=[]
	this.models={}
	this.callback.trigger('clear')
	this.cache.clear(this.name)
}

function Collection(seed, routes){
	this.routes = routes || {}
	this.rest = compileRest(this.routes)
	this.idAttr = 'id'
	this.ajax = ajax
	this.parse = parse
	this.modelIndex = []
	this.models = {}
	this.cache = cache
	this.callback = new Callback

	this.init.apply(this, Array.prototype.splice.call(arguments, 2))

	reload(this)
	this.load(seed)
}

Collection.prototype={
	// to be overriden
	init:function(name, opt){
		this.name = name || this.name
		opt = opt || {}
		this.ajax = opt.ajax || this.ajax
		this.idAttr = opt.idAttr || this.idAttr
		this.parse = opt.parse || this.parse
		this.relativePath = opt.relativePath || false
		this.restParams = opt.restParams || {}
	},
	fini:function(){},

	load:function(models,cb){
		cb=cb||dcb
		if (!models) return cb()
		load(this,models,0,cb)
	},
	create:function(model,cb){
		cb=cb||dcb
		var coll=this
		this.ajax('post', buildRest(this, this.routes.create, model), model, function(err,res){
			if (err) return cb(err)
			cb(null,set(coll,res))
		}, coll)
	},
	replace:function(obj, cb){
		cb=cb||dcb

		var coll = this
		coll.ajax('put', buildRest(coll, coll.routes.update, obj), obj, function(err,res){
			if (err) return cb(err)
			cb(null,set(coll,obj))
		}, coll)
	},
	get:function(id){
		return get(this,id)
	},
	read:function(id, cb, force){
		var coll=this
		if (!force){
			var model=get(this,id)
			if (model) return cb(null, model)
		}
		var params={}
		params[this.idAttr]=id
		this.ajax('get', buildRest(this, this.routes.read, params), params, function(err,res){
			if (err) return cb(err)
			cb(null,set(coll,res))
		}, coll)
	},
	// list(cb) // get all cache
	// list([1,4,89],cb) // get specific items, params are id
	// list(1,100,cb) // pagination, params are index instead of id
	list:function(list,cb){
		var coll=this
		var remained=[]
		var models=[]
		var model
		var i, l, id
		switch(arguments.length){
		case 3:
			for(i=arguments[0],l=arguments[1]; i<=l; i++){
				model=get(this,this.modelIndex[i])
				if (model) models.push(model)
				else remained.push(i)
			}
			cb = arguments[2]
			break
		case 2:
			for(i=0; (id=list[i]); i++){
				model=get(this,id)
				if (model) models.push(model)
				else remained.push(id)
			}
			break
		case 1:
			cb = arguments[0]
			list = this.modelIndex

			for(i=0; (id=list[i]); i++){
				models.push(get(this,id))
			}
			break
		default:
			return
		}
		if (!remained.length) return cb(null,models)
		var params={}
		params[this.idAttr]=remained
		this.ajax('get', buildRest(this, this.routes.list, {}), params, function(err,res){
			if (err) return cb(err)
			if (!res || !res.length) return cb()
			for(var i=0,m; (m=res[i]); i++){
				if (~remained.indexOf(m[coll.idAttr])) models.push(set(coll,m))
				else set(coll, m) // in case list return more than needed
			}
			cb(null,models)
		}, coll)
	},
	remove:function(id,cb){
		cb=cb||dcb
		var coll=this
		var params={}
		params[this.idAttr]=id
		this.ajax('delete', buildRest(this, this.routes.delete, params), params, function(err,res){
			if (err) return cb(err)
			cb(null,remove(coll,id))
		}, coll)
	},
	clear:clear,
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
		return get(this, this.modelIndex[index])
	},
	length: function(){
		return this.modelIndex.length
	}
}

return Collection
