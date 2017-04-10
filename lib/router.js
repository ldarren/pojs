var Callback=require('po/Callback')
var callback
var pStr=require('pico/str')
var h=window.history
var routeMap={}
var compiledRoutes=[]
var trigger=function(rest){
	var params={}
	var state=routeMap[rest]
	if (!state) state=routeMap[pStr.execRest(rest,compiledRoutes,params)]
	callback.trigger('change',state,params)
}
var hashchanged=function(){
	trigger(location.hash.slice(1))
}
var popstate=function(){
	trigger(location.search.slice(3))
}
var goHash=function(hash){
	location.hash=hash
}
var router={
	start:function(routes){
		this.routes(routes)
		popstate()
	},
	routes:function(routes){
		Object.assign(routeMap,routes)
		var keys=Object.keys(routes)
		for (var i=0,k; k=keys[i]; i++){
			pStr.compileRest(k,compiledRoutes)
		}
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
	go:function(path, replace){
		;(replace?h.replaceState:h.pushState).call(h, null, null, '?_='+path)
		popstate()
	}
}

this.load=function(){
	callback=new Callback
	if (h.pushState){
		window.addEventListener('popstate',popstate,false)
	}else{
		router.go=goHash
		popstate=hashchanged
		window.addEventListener('hashchange',popstate,false)
	}
}

return router
