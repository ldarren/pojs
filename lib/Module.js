var pStr=require('pico/str')
var Callback=require('po/Callback')
var INVALID_NAME=/[^a-zA-Z0-9 -]/g
var globalEvents={}
var onGlobalEvent=function(e, des){
	des=des||globalEvents
	var devts=des[e.type]
	if (!devts || !devts.length) return
	for(var i=0,d,target,query; d=devts[i]; i++){
		;(target=e.target) && target.closest && (query=d[2]) && (target=target.closest(query))
		target && d[1].call(d[0],e,target)
		if (e.cancelBubble) break
	}
}
var listen=function(self,el,des,onEvent,action,query,cb){
	var devts=des[action]=des[action]||[]
	devts.push([self,cb,query])
	el.addEventListener(action,onEvent)
}
var unlisten=function(self,el,des,onEvent){
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
var delegate=function(evts){
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
var undelegate=function(){
	unlisten(this,this.el,this.domEvents,this.onEvent)
	unlisten(this,window,globalEvents,onGlobalEvent)
}
var start=function(opt,css){
	this._opt=opt
	this.style(css)
	this.el=this._el=__.dom.get(opt)
	delegate.call(this)
}
var stop=function(){
	this.callback.off()
	undelegate.call(this)
	var el=this._el
	// TODO really no need innerHTML=''?
	el && !this._opt.el && el.parentElement && el.parentElement.removeChild(el)
	this.unstyle()
}
var Module=function(name,opt,css){
	this.id='p'+pStr.rand()
	this.name=(name && name.toString().replace(INVALID_NAME,'-'))||this.id
	this.callback=new Callback
	var des=this.domEvents={}
	this.onEvent=function(e){
		onGlobalEvent(e, des)
	}
	opt && this.start(opt,css)
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
