var Module=require('po/Module')
var mod
var router=require('po/router')
var html=require('users.html')
var css=require('users.css')
var Header=require('Header')
var onHeaderClick=function(evt,name){
	switch(name){
	case 'back':
		//router.back() this caused nodes leak
		router.go('organizations')
		break
	}
}

this.load=function(){
	mod=new Module
}

return {
	start:function(opt,params){
		opt.content=html
		opt.style = {users:css}
		mod.start(opt)

		var header=this.header=new Header
		header.callback.on('click',onHeaderClick,this)
		header.start({el:mod.el.getElementsByTagName('header')[0]},{
			leftText:'back',
			rightText:'',
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
