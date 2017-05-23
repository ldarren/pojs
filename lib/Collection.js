var C=require('po/Collection')
var Model=require('po/Model')
var Callback=require('po/Callback')
var storage=window.localStorage
var dcb=__.dummyCB
var Collection = function(models,routes,name){
	this.name=name
	routes=this.routes=routes||{}
	this.idAttr=routes.idAttr||'id'
	this.modelIndex=[]
	this.models={}
	this.callback=new Callback
	this.load(models)
	this.init()
}
var load=function(coll,models,idx,cb){
	if (models.length <= idx) return cb()
	coll.create(models[idx++],function(err){
		if (err) return cb(err)	
		load(coll,models,idx,cb)
	})
}
var set=function(coll,obj){
	if (!obj) return
	var id=obj[coll.idAttr]
	var model=coll.models[id]
	if (model){
		Object.assign(model,obj)
		model.callback.trigger('update',model,id)
		coll.callback.trigger('update',coll,id)
	}else{
		coll.modelIndex.push(id)
		coll.modelIndex.sort()
		coll.models[id]=Model(obj)
		coll.callback.trigger('add',coll,id)
	}
	storage.setItem(coll.name+':'+id, JSON.stringify(obj))
	return model
}
var get=function(coll,id){
	var model=coll.models[id]
	if (model) return model
	var json=storage.getItem(coll.name+':'+id)
	if (!json) return
	try{ model=Model(JSON.parse(json)) }
	catch(ex){return}
	coll.modelIndex.push(id)
	coll.modelIndex.sort()
	coll.models[id]=model
	return model
}
var remove=function(coll,id){
	if (coll.models[id]){
		var idx=coll.modelIndex.indexOf(id)
		if (~idx){
			var model=coll.models[id]
			model.callback.trigger('delete',model,id)
			coll.callback.trigger('delete',coll,id)
			coll.modelIndex.splice(idx,1)
		}
		delete coll.models[id]
	}

	storage.removeItem(coll.name+':'+id)
}
var clear=function(){
	this.modelIndex=[]
	this.models={}
	this.callback.trigger('clear')
	storage.clear()
}

Collection.ajax=function(method,route,params,cb){
	if (!route) return cb(null,params)
	pico.ajax(method,route,params,null,function(err,state,res){
		if (4!==state) return
		if (err) return cb(err)
		try{var obj=JSON.parse(res)}
		catch(ex){return cb(ex)}
		cb(null,res)
	})
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
		C.ajax('post',this.routes.create,model,function(err,res){
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
		C.ajax('get',this.routes.read,params,function(err,res){
			if (err) return cb(err)
			cb(null,set(coll,res))
		})
	},
	// list(1,100,cb)
	// list([1,4,89],cb)
	list:function(list,cb){
		var coll=this
		var remained=[]
		var models=[]
		var model
		if (3===arguments.length){
			for(var i=arguments[0],l=arguments[1]; i<=l; i++){
				model=get(this,i)
				if (model) models.push(model)
				else remained.push(i)
			}
		}else{
			for(var i=0,id; id=list[i]; i++){
				model=get(this,id)
				if (model) models.push(model)
				else remained.push(id)
			}
		}
		if (!remained.length) return cb(null,models)
		var params={}
		params[this.idAttr]=remained
		C.ajax('get',this.routes.list,params,function(err,res){
			if (err) return cb(err)
			if (!res || !res.length) return cb()
			for(var i=0,m; m=res[i]; i++){
				models.push(set(coll,m))
			}
			cb(null,models)
		})
	},
	update:function(model,cb){
		cb=cb||dcb
		var coll=this
		C.ajax('put',this.routes.update,model,function(err,res){
			if (err) return cb(err)
			cb(null,set(coll,res))
		})
	},
	remove:function(id,cb){
		cb=cb||dcb
		var coll=this
		var params={}
		params[this.idAttr]=id
		C.ajax('delete',this.routes.delete,params,function(err,res){
			if (err) return cb(err)
			cb(null,remove(coll,id))
		})
	},
	clear:clear
}

return Collection
