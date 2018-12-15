var pStr=require('pico/str')
var Callback=require('po/Callback')
var callback
var h=window.history
var _path=''
var _started=false
var routeMap={}
var compiledRoutes=[]
var trigger=function(path){
	_path=path
	var params={}
	var state=routeMap[path]
	if (!state) state=routeMap[pStr.execRest(path,compiledRoutes,params)]
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
		_started=true
		popstate()
		return this
	},
	routes:function(routes){
		if (!routes) return this
		Object.assign(routeMap,routes)
		var keys=Object.keys(routes)
		for (var i=0,k; (k=keys[i]); i++){
			pStr.compileRest(k,compiledRoutes)
		}
		return this
	},
	reset:function(routes){
		routeMap={}
		_started=false
		return this.routes(routes)
	},
	on:function(key,cb,ctx){
		callback.on(key,cb,ctx)
		return this
	},
	off:function(key,cb,ctx){
		callback.off(key,cb,ctx)
		return this
	},
	back:function(steps){
		if (steps) return h.go(-steps)
		h.back()
		return this
	},
	forward:function(steps){
		if (steps) return h.go(steps)
		h.forward()
		return this
	},
	go:function(path, replace){
		path=path||''
		if (path===_path) return this
		;(replace?h.replaceState:h.pushState).call(h, null, null, '?_='+path)
		popstate()
		return this
	},
	depth:function(){
		return h.length
	},
	path: function(){
		return _path
	},
	started: function(){
		return _started
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
