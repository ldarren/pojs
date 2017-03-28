var View=require('lib/View')
var view
var router=require('lib/router')
var html=require('organizations.html')
var css=require('organizations.css')
var coll=require('coll_organizations')
var Header=require('Header')
var List=require('List')
var Row=require('Row')
var onHeaderClick=function(name){
	switch(name){
	case 'next':
		router.go({page:'users'})
		break
	}
}
var onListSelect=function(){
}

this.load=function(){
	view=new View
}

return {
	start:function(el,params){
		view.start(el,params,'organizations',html,css)

		var header=this.header=new Header
		header.callback.on('click',onHeaderClick,this)
		header.start(el.getElementsByTagName('header')[0],{
			leftText:'',
			rightText:'next',
			title:'Organizations',
			subtitle:'subtitle'
		})

		var list=this.list=new List
		list.callback.on('select',onListSelect,this)
		list.start(el.getElementsByTagName('content')[0],{
			collection:coll,
			Row:Row
		})
	},
	stop:function(){
		this.list.stop()
		this.header.stop()
		this.header=this.list=undefined

		view.stop('organizations')
	}
}
