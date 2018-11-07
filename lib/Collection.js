var pStr=require('pico/str')
var Model=require('po/Model')
var Callback=require('po/Callback')
var storage=window.localStorage
var dcb=__.dummyCB

var dummyNetwork = {
	ajax:function(method,route,params,cb){
		if (!route) return cb(null,params)
		pico.ajax(method,route,params,null,function(err,state,res){
			if (4!==state) return
			if (err) return cb(err)
			try{var obj=JSON.parse(res)}
			catch(ex){return cb(ex)}
			cb(null,obj)
		})
	}
}

function Collection(data,routes,name,network,opt){
	this.name=name || 'C'+pStr.rand()
	routes=this.routes=routes||{}
	opt = opt || {}
	this.idAttr=opt.idAttr||'id'
	this.network=network || dummyNetwork
	this.modelIndex=[]
	this.models={}
	this.callback=new Callback
	this.load(data)
	opt.reload && reload(this, name+':')
	this.init()
}
function populate(coll, id, obj){
	coll.modelIndex.push(id)
	coll.modelIndex.sort()
	var model = coll.models[id] = Model(obj, coll.idAttr)
	model.callback.on('*', update, [coll, id])
	return model
}
function reload(coll, name){
	for(var i=0,k,json,obj; k=storage.key(i); i++){
		if (0 !== k.indexOf(name)) continue
		json=storage.getItem(k)
		if (!json) {
			storage.removeItem(k)
			continue
		}
		try{ obj=JSON.parse(json) }
		catch(ex){
			storage.removeItem(k)
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
	var model=coll.models[id]
	if (!model){
		model = populate(coll, id, obj)
		coll.callback.trigger('add',coll,id)
	}
	storage.setItem(coll.name+':'+id, JSON.stringify(obj))
	return model
}
function get(coll,id){
	var model=coll.models[id]
	if (model) return model
	var json=storage.getItem(coll.name+':'+id)
	if (!json) return
	try { return populate(coll, id, JSON.parse(json)) }
	catch (ex) { return }
}
function update(){
	var coll = this[0]
	var id = this[1]
	var model = get(coll, id)
	coll.network.ajax('put',coll.routes.update,model,function(err,res){
		if (err) return cb(err)
		coll.callback.trigger('update',coll,id)
		storage.setItem(coll.name+':'+id, JSON.stringify(model))
	})
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

	storage.removeItem(coll.name+':'+id)
}
function clear(){
	this.modelIndex=[]
	this.models={}
	this.callback.trigger('clear')
	storage.clear()
}

Collection.prototype={
	// to be overriden
	init:function(){},
	fini:function(){},

	load:function(models,cb){
		cb=cb||dcb
		if (!models) return cb()
		load(this,models,0,cb)
	},
	create:function(model,cb){
		cb=cb||dcb
		var coll=this
		this.network.ajax('post',this.routes.create,model,function(err,res){
			if (err) return cb(err)
			cb(null,set(coll,res))
		})
	},
	get:function(id){
		return get(this,id)
	},
	read:function(id,cb){
		var coll=this
		var model=get(this,id)
		if (model) return cb(null,model)
		var params={}
		params[this.idAttr]=id
		this.network.ajax('get',this.routes.read,params,function(err,res){
			if (err) return cb(err)
			cb(null,set(coll,res))
		})
	},
	// list(cb)
	// list([1,4,89],cb)
	// list(1,100,cb)
	list:function(list,cb){
		var coll=this
		var remained=[]
		var models=[]
		var model
		switch(arguments.length){
		case 3:
			for(var i=arguments[0],l=arguments[1]; i<=l; i++){
				model=get(this,this.modelIndex[i])
				if (model) models.push(model)
				else remained.push(i)
			}
			cb = arguments[2]
			break
		case 2:
			for(var i=0,id; id=list[i]; i++){
				model=get(this,id)
				if (model) models.push(model)
				else remained.push(id)
			}
			break
		case 1:
			cb = arguments[0]
			list = this.modelIndex
			
			for(var i=0,id; id=list[i]; i++){ models.push(get(this,id)) }
			break
		default:
			return
		}
		if (!remained.length) return cb(null,models)
		var params={}
		params[this.idAttr]=remained
		this.network.ajax('get',this.routes.list,params,function(err,res){
			if (err) return cb(err)
			if (!res || !res.length) return cb()
			for(var i=0,m; m=res[i]; i++){
				if (~remained.indexOf(m[this.idAttr])) models.push(set(coll,m))
				else set(coll, m) // in case list return more than needed
			}
			cb(null,models)
		})
	},
	remove:function(id,cb){
		cb=cb||dcb
		var coll=this
		var params={}
		params[this.idAttr]=id
		this.network.ajax('delete',this.routes.delete,params,function(err,res){
			if (err) return cb(err)
			cb(null,remove(coll,id))
		})
	},
	clear:clear,
	filter: function(cb){
		var list = this.modelIndex
		var models = []
		for (var i = 0, model, id; id = list[i]; i++){
			model = get(this, id)
			if (cb(model, i, id, this)) models.push(model)
		}
		return models
	},
	find: function(cb){
		var list = this.modelIndex
		var model
		for (var i = 0, id; id = list[i]; i++){
			model = get(this, id)
			if (cb(model, i, id, this)) return model
		}
	},
	forEach: function(cb){
		var list = this.modelIndex
		for (var i = 0, id; id = list[i]; i++){
			cb(get(this, id), i, id, this)
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
