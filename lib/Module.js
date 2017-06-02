var pStr=require('pico/str')
var Callback=require('po/Callback')
var listen=function(evts){
	var el=this.el
	evts=evts||this.events
	if (!el || !evts) return
	var des=this.domEvents
	var sidx,action,devts
	for(var evt in evts){
		sidx=evt.indexOf(' ')
		if (-1===sidx) sidx=evt.length-1
		action=evt.substr(0,sidx)
		if (!action) continue
		devts=des[action]=des[action]||[]
		devts.push([this,evts[evt],evt.substr(sidx)])
		el.addEventListener(action,this.onEvent,false)
	}
}
var unlisten=function(){
	var el=this.el
	var des=this.domEvents
	var keys=Object.keys(des)
	for(var j=0,list,k; k=keys[j]; j++){
		list=des[k]
		for(var i=0,l; l=list[i];){
			if (this===l[0]) list.splice(i,1)
			else i++
		}
		if (!list.length){
			el.removeEventListener(k,this.onEvent)
			delete des[k]
		}
	}
}
var start=function(opt,css){
	this._opt=opt
	this.style(css)
	this.el=this._el=__.dom.get(opt)
	listen.call(this)
};
var stop=function(){
	this.callback.off()
	unlisten.call(this)
	var el=this._el
	// TODO really no need innerHTML=''?
	el && !this._opt.el && el.parentElement && el.parentElement.removeChild(el)
	this.unstyle()
};
var Module=function(name,opt,css){
	this.id='p'+pStr.rand()
	this.name=name||this.id
	this.callback=new Callback
	var des=this.domEvents={}
	this.onEvent=function(e){
		var devts=des[e.type]
		if (!devts || !devts.length) return
		for(var i=0,d,target,query; d=devts[i]; i++){
			;(target=e.target) && (query=d[2]) && (target=target.closest(query))
			target && d[1].call(d[0],e,target)
		}
	}
	opt && this.start(opt,css)
}

// options: el,id,className,tagName,attributes
Module.prototype={
	// to be overriden
	start:start,
	stop:stop,

	setElement:function(el){
		unlisten.call(this)
		this.el=el
		listen.call(this)
	},

	style:function(css){ __.dom.style(this.name,css) },
	unstyle:function(){ __.dom.unstyle(this.name) },

	delegateEvents:function(){
		unlisten.call(this)
		listen.call(this)
	},
	undelegateEvents:unlisten
}

return Module
