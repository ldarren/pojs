inherit('lib/View')
var tmpl=require('Row.asp')
var Row=function(model){
	Row.__super__.constructor.call(this)
	this.model
}

Row.prototype={
	start:function(opt,params){
		opt.childs=tmpl(params)
		this.create(opt)
		this.model=params.model||this.model
		params.desc=params.desc+Date.now()
	}
}

return Row
