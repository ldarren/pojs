var pStr=require('pico/str')
var Callback=require('po/Callback')
var INVALID_NAME=/[^a-zA-Z0-9 -]/g
function remove(el, keepFirst){
	while(el.hasChildNodes()){
		remove(el.lastChild)
	}
	!keepFirst && el.parentElement.removeChild(el)
}
function createListener(des){
	return function (e){
		var devts=des[e.type]
		if (!devts || !devts.length) return
		for(var i=0,d,target,query; d=devts[i]; i++){
			;(target=e.target) && target.closest && (query=d[2]) && (target=target.closest(query))
			target && d[1].call(d[0],e,target)
			target = void 0
			if (e.cancelBubble) break
		}
	}
}
var globalEvents={}
var onGlobalEvent=createListener(globalEvents)
function listen(self,el,des,onEvent,action,query,cb){
	var devts=des[action]=des[action]||[]
	devts.push([self,cb,query])
	el.addEventListener(action,onEvent)
}
function unlisten(self,el,des,onEvent){
	var keys=Object.keys(des)
	var list,i,l
	for(var j=0,k; k=keys[j]; j++){
		list=des[k]
		for(i=0; l=list[i];){
			if (self===l[0]) list.splice(i,1)
			else i++
		}
		if (!list.length){
			el.removeEventListener(k,onEvent)
			delete des[k]
		}
	}
}
function delegate(evts){
	var el=this.el
	evts=evts||this.events
	if (!el || !evts) return
	var des=this.domEvents
	var sidx,action
	for(var evt in evts){
		sidx=evt.indexOf(' ')
		if (-1===sidx) sidx=evt.length
		action=evt.substr(0,sidx)
		if (!action) continue
		if (97	<= action.charCodeAt())
			listen(this,el,des,this.onEvent,action,evt.substr(sidx+1),evts[evt])
		else
			listen(this,window,globalEvents,onGlobalEvent,action.toLowerCase(),evt.substr(sidx+1),evts[evt])
	}
}
function undelegate(){
	unlisten(this,this.el,this.domEvents,this.onEvent)
	unlisten(this,window,globalEvents,onGlobalEvent)
}
function start(opt,css){
	this.domEvents={}
	this.onEvent=createListener(this.domEvents)
	this.style(css)
	this._opt=opt
	this.el=this._el=__.dom.get(opt)
	delegate.call(this)
}
function stop(){
	this._removed = 1
	this.callback.off()
	if (this._el) {
		undelegate.call(this)
		remove(this._el, !!this._opt.el)
		this.unstyle()
		this.domEvents = this.onEvent = this._el = this.el = this._opt=void 0
	}
}
function Module(name){
	this.id='M'+pStr.rand()
	this.name=(name && name.toString().replace(INVALID_NAME,'-'))||this.id
	this.callback=new Callback
}

// options: el,id,className,tagName,attributes
Module.prototype={
	// to be overriden
	start:start,
	stop:stop,

	setElement:function(el){
		undelegate.call(this)
		this.el=el
		delegate.call(this)
	},

	style:function(css){ __.dom.style(this.name,css) },
	unstyle:function(){ __.dom.unstyle(this.name) },

	delegateEvents:function(evt){
		!evt && undelegate.call(this)
		delegate.call(this, evt)
	},
	undelegateEvents:undelegate
}

return Module
