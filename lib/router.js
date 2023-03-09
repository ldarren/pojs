var pStr=require('pico/str')
var Callback=require('po/Callback')
var callback
var h=window.history
var _started=false
var routeMap={}
var route=''
var params={}
var state=null
var _embed = function(path){
	return '#' + path
}
var _extract = function(){
	return location.hash.substring(1)
}
var radix=new pStr.Radix
function popstate(evt){
	params={}
	state=evt ? evt.state : null
	route=_extract()
	var payload=routeMap[route]
	if (null==payload){
		route=radix.match(route,params)
		payload=routeMap[route]
		Object.keys(params).reduce((acc, k) => acc[k] = decodeURIComponent(params[k]), params)
	}
	callback.trigger('change', payload, params, state)
}
var router={
	start:function(routes, embed, extract){
		_embed=embed || _embed
		_extract=extract || _extract
		this.routes(routes)
		_started=true
		popstate()
		return this
	},
	routes:function(routes){
		if (!routes) return this
		Object.assign(routeMap,routes)
		var keys=Object.keys(routes)
		for (var i=0,l=keys.length; i<l; i++){
			radix.add(keys[i])
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
		;(replace?h.replaceState:h.pushState).call(h, state || h.state, title || '', _embed(path))
		popstate()
		return this
	},
	depth:function(){
		return h.length
	},
	started:function(){
		return _started
	},
	getRoute:function(){
		return route
	},
	getState:function(){
		return state
	},
	getParam:function(key){
		return params[key]
	},
}

this.load=function(){
	callback=new Callback
	window.addEventListener('popstate',popstate)
}

return router
