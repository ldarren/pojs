inherit('lib/View')
var html=require('Row.html')
var css=require('Row.css')
var Row=function(model){
	Row.__super__.constructor.call(this)
	this.model
}

Row.prototype={
	start:function(el,params){
		Row.__super__.start.call(this,el,params,'row',html,css)
		this.model=params.model||this.model
		params.desc=params.desc+Date.now()
	},
	stop:function(){
		Row.__super__.stop.call(this,'row')
	}
}

return Row
