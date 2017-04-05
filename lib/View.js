var pStr=require('pico/str')
var dom=require('lib/dom.js')
var Callback=require('lib/Callback')
var listen=function(ctx){
	var evts=ctx.events
	var domEvents=ctx.domEvents
	var el=ctx.el
	if (!evts) return
	var arr,eles,devts
	for(var evt in evts){
		arr=evt.split(' ',2)
		if (2!==arr.length) continue
		eles=el.querySelectorAll(arr[1])
		devts=domEvents[arr[0]]=domEvents[arr[0]]||[]
		devts.push([ctx,evts[evt],Array.prototype.slice.call(eles)])
		el.addEventListener(arr[0],ctx.onEvent,false)
	}
}
var unlisten=function(ctx){
	var el=ctx.el
	var domEvents=ctx.domEvents
	var list
	var keys=Object.keys(domEvents)
	for(var j=0,k; k=keys[j]; j++){
		list=domEvents[k]
		for(var i=0,l; l=list[i];){
			if (ctx===l[0]) list.splice(i,1)
			else i++
		}
		if (!list.length){
			el.removeEventListener(k,ctx.onEvent)
			delete domEvents[k]
		}
	}
}
var View=function(){
	this.id='p'+pStr.rand()
	this.callback=new Callback
	var domEvents={}
	this.domEvents=domEvents
	this.onEvent=function(e){
		var devts=domEvents[e.type]
		if (!devts || !devts.length) return
		for(var i=0,d; d=devts[i]; i++){
			if (~d[2].indexOf(e.target)){
				d[1].call(d[0],e)
			}
		}
	}
}

// options: el,id,className,tagName,attributes,css
View.prototype={
	// to be overriden
	start:function(opt){ this.create(opt) },
	stop:function(){ this.remove() },

	create:function(opt){
		this.el=__.dom.get(opt)
		if (opt.css)__.dom.style(this.id,opt.css)
		listen(this)
	},
	render:function(){
		return this.el
	},
	remove:function(){
		this.callback.off()
		unlisten(this)
		this.el.innerHTML=''
		__.dom.unstyle(this.id)
	}
}

return View
