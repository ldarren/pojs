var View=require('po/View')
var view
var router=require('po/router')
var html=require('users.html')
var css=require('users.css')
var Header=require('Header')
var onHeaderClick=function(evt,name){
	switch(name){
	case 'back':
		router.back()
		break
	}
}

this.load=function(){
	view=new View
}

return {
	start:function(opt,params){
		opt.content=html
		view.start(opt,css)

		var header=this.header=new Header
		header.callback.on('click',onHeaderClick,this)
		header.start({el:view.el.getElementsByTagName('header')[0]},{
			leftText:'back',
			rightText:'',
			title:'Users',
			subtitle:'subtitle'
		})
	},
	stop:function(){
		this.header.stop()
		this.header=undefined

		view.stop()
	}
}
