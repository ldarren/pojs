var View=require('po/View')
var view
var Collection=require('po/Collection')
var coll
var router=require('po/router')
var html=require('organizations.html')
var css=require('organizations.css')
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
	coll=new Collection
	coll.load([{
			id:1,
			name:'AAA',
			desc:'the tail of your dump file indicates that you have'
		},{
			id:2,
			name:'BBB',
			desc:'Try using forward slash'
		},{
			id:3,
			name:'CCC',
			desc:'When running this on a file that is'
	}],function(err){
		console.log('load orgs done',err)
	})
}

return {
	start:function(opt,params){
		opt.css=css
		opt.childs=html
		view.start(opt)

		var header=this.header=new Header
		header.callback.on('click',onHeaderClick,this)
		header.start({el:view.el.getElementsByTagName('header')[0]},{
			leftText:'',
			rightText:'next',
			title:'Organizations',
			subtitle:'subtitle'
		})

		var list=this.list=new List
		list.callback.on('select',onListSelect,this)
		list.start({el:view.el.getElementsByTagName('content')[0]},{
			collection:coll,
			Row:Row
		})
	},
	stop:function(){
		this.list.stop()
		this.header.stop()
		this.header=this.list=undefined

		view.stop()
	}
}
