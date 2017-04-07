var Callback=require('po/Callback')
var h=window.history
var listeners=[]
var callback
var popstate=function(evt){
	var state=evt.state
	if (!state){
		var query=document.location.search.slice(1)
		if (query){
			var fields=query.split('&')
			state={}
			for(var i=0,f,arr; f=fields[i]; i++){
				arr=decodeURIComponent(f).split('=')
				state[arr[0]]=arr[1]
			}
		}
	}
	callback.trigger('change',state)
}

this.load=function(){
	callback=new Callback
	window.addEventListener('popstate',popstate,false)
}

return {
	start:function(state){
		popstate(state||{})
	},
	on:function(key,cb,ctx){
		callback.on(key,cb,ctx)
	},
	off:function(key,cb,ctx){
		callback.off(key,cb,ctx)
	},
	back:function(steps){
		if (steps) return h.go(-steps)
		h.back()
	},
	forward:function(steps){
		if (steps) return h.go(steps)
		h.forward()
	},
	depth:function(){
		return h.length
	},
	go:function(state, replace){
		;(replace?h.replaceState:h.pushState).call(h,state, '', '?'+__.querystring(state))
		callback.trigger('change',state)
	}
}
