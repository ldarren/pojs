var Module=inherit('po/Module')
var tmpl=require('Row.asp')
var Row=function(model){
	Row.__super__.constructor.call(this)
	this.model=model
}

Row.prototype={
	start:function(opt,params){
		opt.content=tmpl(params)
		Module.prototype.start.call(this,opt)
		this.model=params.model||this.model
		params.desc=params.desc+Date.now()
	}
}

return Row
