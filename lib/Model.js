var Callback=require('po/Callback')
var changes={
	has:function(obj, key){
		return key in obj
	},
	get:function(obj, key){
		return obj[key]
	},
	set:function(obj, key, value){
		var ov=obj[key]
		value = __.escapeXML(value)
		if (value === ov) return false
		obj[key]=value
		if (void 0 == ov){
			obj.callback.trigger('field.add',key,value)
		}else{
			obj.callback.trigger('field.update',key,value,ov)
		}
		return true
	},
	deleteProperty:function(obj, key){
		if (key in obj){
			obj[key] = void 0
			obj.callback.trigger('field.delete',key)
		}
	},
	ownKeys:function(obj){
		return Object.keys(obj)
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
			configurable:true
		} : void 0 
	}
}

return function(obj, idAttr){
	obj = JSON.parse(__.escapeXML(JSON.stringify(obj))) // let it throw
	Object.defineProperty(obj, 'callback', {
		value: new Callback,
		writable:false,
		enumerable:false,
		configurable:true
	})
	if (idAttr && 'id' !== idAttr) {
		Object.defineProperty(obj, 'id', {
			value: obj[idAttr],
			writable:false,
			enumerable:false,
			configurable:true
		})
	}
	return new Proxy(obj, changes)
}
