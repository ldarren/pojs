inherit('lib/View')
var tmpl=require('Row.asp')
var css=require('Row.css')
var Row=function(model){
	Row.__super__.constructor.call(this)
	this.model
}

Row.prototype={
	start:function(opt,params){
		opt.css=css
		opt.childs=this.compile(tmpl,params)
		Row.__super__.start.call(this,opt)
		this.model=params.model||this.model
		params.desc=params.desc+Date.now()
	},
	stop:function(){
		Row.__super__.stop.call(this)
	}
}

return Row
