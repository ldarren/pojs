var Module=require('po/Module')
var mod
var router=require('po/router')
var Header=require('Header')
var onHeaderClick=function(evt,name){
	//router.back()
	router.go('organizations')
}

this.load=function(){
	mod=new Module
}

return {
	start:function(opt,params){
		mod.start(opt)

		var header=this.header=new Header
		header.callback.on('click',onHeaderClick,this)
		header.start({el:mod.el},{
			leftText:'back',
			rightText:'back',
			title:'Users',
			subtitle:'subtitle'
		})
	},
	stop:function(){
		this.header.stop()
		this.header=void 0

		mod.stop()
	}
}
