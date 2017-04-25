var pStr=require('pico/str')
var Callback=require('po/Callback')
var listen=function(ctx){
	var el=ctx.el
	var evts=ctx.events
	if (!el || !evts) return
	var des=ctx.domEvents
	var arr,eles,devts
	for(var evt in evts){
		arr=evt.split(' ',2)
		if (2!==arr.length) continue
		eles=el.querySelectorAll(arr[1])
		devts=des[arr[0]]=des[arr[0]]||[]
		devts.push([ctx,evts[evt],Array.prototype.slice.call(eles)])
		el.addEventListener(arr[0],ctx.onEvent,false)
	}
}
var unlisten=function(ctx){
	var el=ctx.el
	var des=ctx.domEvents
	var keys=Object.keys(des)
	for(var j=0,list,k; k=keys[j]; j++){
		list=des[k]
		for(var i=0,l; l=list[i];){
			if (ctx===l[0]) list.splice(i,1)
			else i++
		}
		if (!list.length){
			el.removeEventListener(k,ctx.onEvent)
			delete des[k]
		}
	}
}
var start=function(self,opt){
	self.el=__.dom.get(opt)
	if (opt && opt.css)__.dom.style(self.id,opt.css)
	listen(self)
};
var stop=function(self){
	self.callback.off()
	unlisten(self)
	__.dom.unstyle(self.id)
	if (self.el) self.el.innerHTML=''
};
var View=function(opt){
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
	if (opt) this.start(opt)
}

// options: el,id,className,tagName,attributes,css
View.prototype={
	// to be overriden
	start:function(opt){ start(this,opt) },
	stop:function(){ stop(this) },

	render:function(){
		return this.el
	}
}

return View
