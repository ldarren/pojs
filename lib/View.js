var pStr=require('pico/str')
var Callback=require('po/Callback')
var listen=function(evts){
	var el=this.el
	evts=evts||this.events
	if (!el || !evts) return
	var des=this.domEvents
	var arr,eles,devts
	for(var evt in evts){
		arr=evt.split(' ',2)
		if (2!==arr.length) continue
		eles=el.querySelectorAll(arr[1])
		devts=des[arr[0]]=des[arr[0]]||[]
		devts.push([this,evts[evt],Array.prototype.slice.call(eles)])
		el.addEventListener(arr[0],this.onEvent,false)
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
	if (el && !this._opt.el && el.parentElement) el.parentElement.removeChild(el)
	this.unstyle()
};
var View=function(opt,css){
	this.id='p'+pStr.rand()
	this.callback=new Callback
	var des=this.domEvents={}
	this.onEvent=function(e){
		var devts=des[e.type]
		if (!devts || !devts.length) return
		for(var i=0,d; d=devts[i]; i++){
			if (~d[2].indexOf(e.target)){
				d[1].call(d[0],e)
			}
		}
	}
	if (opt) this.start(opt,css)
}

// options: el,id,className,tagName,attributes
View.prototype={
	// to be overriden
	start:start,
	stop:stop,

	setElement:function(el){
		unlisten.call(this)
		this.el=el
		listen.call(this)
	},

	style:function(css){ __.dom.style(this.id,css) },
	unstyle:function(){ __.dom.unstyle(this.id) },

	delegateEvents:listen,
	undelegateEvents:unlisten
}

return View
