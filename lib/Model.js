var Callback=require('po/Callback')
var changes={
	has:function(obj, key){
		return key in obj
	},
	get:function(obj, key){
		if (void 0 == key) return obj
		return obj[key]
	},
	set:function(obj, key, value){
		if ('callback'===key) return false
		var ov=obj[key]
		if (value === ov) return false
		if (key in obj){
			obj.callback.trigger('field.update',key,value,ov)
		}else{
			obj.callback.trigger('field.add',key,value)
		}
		obj[key]=value
		return true
	},
	deleteProperty:function(obj, key){
		if ('callback'===key) return false
		if (key in obj){
			obj.callback.trigger('field.delete',key)
			delete obj[key]
		}
	},
	enumerate:function(obj){
		return obj.keys()
	},
	ownKeys:function(obj){
		obj.keys()
	},
	defineProperty:function(obj, key, desc){
		if (desc && desc.value){
			return changes.set(obj,key,desc.value)
		}
		return false
	},
	getOwnPropertyDescriptor:function(obj,key){
		var v=obj[key]
		return v ? {
			value: v,
			writable:true,
			enumerable:true,
			configurable:false
		} : void 0 
	}
}

return function(obj){
	obj.callback=new Callback
	return new Proxy(obj, changes)
}
