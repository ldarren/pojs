var pStr=require('pico/str')
var Callback=require('po/Callback')
var callback
var h=window.history
var _path=null
var _started=false
var routeMap={}
var radix=new pStr.Radix
var trigger=function(path, state){
	if (_path===path) return
	var params={}
	var payload=routeMap[path]
	if (!payload){
		payload=routeMap[radix.match(path,params)]
		Object.keys(params).reduce((acc, k) => acc[k] = decodeURIComponent(params[k]), params)
	}
	if (payload) _path = path
	callback.trigger('change',payload,params,state)
}
var popstate=function(evt){
console.log('!!!popstate', evt)
	trigger(location.pathname, evt ? evt.state : null)
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
			radix.add(k)
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
console.log('!!!!!!!!back!')
		return this
	},
	forward:function(steps){
		if (steps) return h.go(steps)
		h.forward()
console.log('!!!!!!!!forward!')
		return this
	},
	go:function(path, replace, state, title){
		path=path||''
		if (path===_path) return this
		;(replace?h.replaceState:h.pushState).call(h, state || {}, title || '', path)
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
	window.addEventListener('popstate',popstate)
}

return router
