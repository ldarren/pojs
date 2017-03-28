inherit('lib/View')
var css=require('List.css')
var List=function(coll,Row){
	List.__super__.constructor.call(this)
	this.coll=coll
	this.Row=Row
}

List.prototype={
	start:function(el,params){
		List.__super__.start.call(this,el,params,'list',null,css)
		this.coll=params.collection||this.coll
		this.Row=params.Row||this.Row
	},
	stop:function(){
		List.__super__.stop.call(this,'list')
	}
}

return List
