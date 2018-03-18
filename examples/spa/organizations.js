var Module=require('po/Module')
var mod
var Collection=require('po/Collection')
var CollOrganizations=require('CollOrganizations')
var coll
var router=require('po/router')
var html=require('organizations.html')
var css=require('organizations.css')
var Header=require('Header')
var List=require('List')
var Row=require('Row')
var onHeaderClick=function(evt,name){
	switch(name){
	case 'next':
		router.go('users/u156')
		break
	}
}
var onListSelect=function(evt){
}

this.load=function(){
	mod=new Module
	// should use inherit in CollOrganizations, this is to test extend only
	coll=new (Collection.extend(CollOrganizations))
}

return {
	start:function(opt,params){
		opt.content=html
		opt.style = {organizations:css}
		mod.start(opt)

		coll.forEach(function(ite, index, id, coll){
			console.log(coll.name)
		})

		var header=this.header=new Header
		header.callback.on('click',onHeaderClick,this)
		header.start({el:mod.el.getElementsByTagName('header')[0]},{
			leftText:'',
			rightText:'next',
			title:'Organizations',
			subtitle:'subtitle'
		})

		var list=this.list=new List
		list.callback.on('select',onListSelect,this)
		list.start({el:mod.el.getElementsByTagName('content')[0]},{
			collection:coll,
			Row:Row
		})
	},
	stop:function(){
		this.list.stop()
		this.header.stop()
		this.header=this.list=void 0

		mod.stop()
	}
}
