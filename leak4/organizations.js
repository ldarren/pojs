var Module=require('po/Module')
var mod
var router=require('po/router')
var Header=require('Header')
var onHeaderClick=function(evt,name){
	router.go('users/u156')
	//this.callback.trigger('click','users')
}

this.load=function(){
	mod=new Module
}

return {
	start:function(opt,params){
		mod.start(opt)

		var header=this.header=new Header
		header.callback.on('click',onHeaderClick,mod)
		header.start({el:mod.el},{ leftText:'next' })
	},
	stop:function(){
		this.header.stop()
		this.header=void 0

		mod.stop()
	},
	callback:function(){
		return mod.callback
	}
}
