var Model=require('lib/Model')
var CallBack=require('lib/CallBack')
var storage=window.localStorage
var Collection = function(name,routes,opt){
	this.name=name
	this.routes=routes||{}
	opt=opt||{}
	this.idAttr=opt.idAttr||'id'
	this.modelIndex=[]
	this.models={}
	this.callback=new CallBack
}
var ajax=function(method,route,params,cb){
	if (!route) return cb()
	amd.ajax(method,route,params,null,function(err,state,res,coll){
		if (4!==state) return
		if (err) return cb(err)
		try{var obj=JSON.parse(res)}
		catch(ex){return cb(ex)}
		cb(null,res)
	},this)
}
var set=function(coll,obj){
	if (!obj) return
	var id=obj[coll.idAttr]
	var model=coll.models[id]
	if (model){
		Object.assign(model,obj)
		model.siglot.trigger('update',model,id)
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

Collection.prototype={
	create:function(model,cb){
		ajax(this,'post',this.routes.create,model,function(err,res,coll){
			if (err) return cb(err)
			cb(null,set(coll,res))
		})
	},
	read:function(id,cb){
		var model=get(this,id)
		if (model) return cb(null,model)
		var params={}
		params[this.idAttr]=id
		ajax(this,'get',this.routes.read,params,function(err,res,coll){
			if (err) return cb(err)
			cb(null,set(coll,res))
		})
	},
	// list(1,100,cb)
	// list([1,4,89],cb)
	list:function(list,cb){
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
		ajax(this,'get',this.routes.list,params,function(err,res,coll){
			if (err) return cb(err)
			if (!res || !res.length) return cb()
			for(var i=0,m; m=res[i]; i++){
				models.push(set(coll,m))
			}
			cb(null,models)
		})
	},
	update:function(model,cb){
		ajax(this,'put',this.routes.update,model,function(err,res,coll){
			if (err) return cb(err)
			cb(null,set(coll,res))
		})
	},
	remove:function(id,cb){
		var params={}
		params[this.idAttr]=id
		ajax(this,'delete',this.routes.delete,params,function(err,res,coll){
			if (err) return cb(err)
			cb(null,remove(coll,id))
		})
	},
	clear:clear
}

return Collection
