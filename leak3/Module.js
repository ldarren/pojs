function Module(parent, content,cb){
	this.el=parent
	this.content=content
	this.cb=cb
}
Module.prototype={
	start:function(){
		this.el.innerHTML=this.content
		this.el.addEventListener('click',this.cb)
	},
	stop:function(){
		this.el.removeEventListener('click',this.cb)
		this.el.innerHTML=''
	}
}
return Module
