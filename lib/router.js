var pStr=require('pico/str')
var Callback=require('po/Callback')
var callback
var h=window.history
var base // path static part
var _started=false
var routeMap={}
var route=''
var params={}
var state=null
var radix=new pStr.Radix
var extract = function(base){
	return location.pathname.substring(base.length)
}
function popstate(evt){
	params={}
	state=evt ? evt.state : null
	route=extract(base)
	var payload=routeMap[route]
	if (!payload){
		route=radix.match(route,params)
		payload=routeMap[route]
		Object.keys(params).reduce((acc, k) => acc[k] = decodeURIComponent(params[k]), params)
	}
	callback.trigger('change', payload, params, state)
}
var router={
	start:function(routes, offset, customExtract){
		base = offset || ''
		extract = customExtract || extract
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
		if (steps) h.go(-steps)
		else h.back()
		return false
	},
	forward:function(steps){
		if (steps) h.go(steps)
		else h.forward()
		return false
	},
	go:function(path, replace, state, title){
		path=path||''
		;(replace?h.replaceState:h.pushState).call(h, state || {}, title || '', base + path)
		popstate()
		return this
	},
	depth:function(){ return h.length },
	started: function(){ return _started },
	getRoute: function(){ return route },
	getState: function(){ return state },
	getParam: function(key){ return params[key] },
}

this.load=function(){
	callback=new Callback
	window.addEventListener('popstate',popstate)
}

return router
