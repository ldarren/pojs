var Module=inherit('po/Module')
var tmpl=require('Row.asp')
var Row=function(model){
	Row.prototype.constructor.call(this)
	this.model=model
}

Row.prototype={
	start:function(opt,params){
		opt.content=tmpl(params)
		Module.prototype.start.call(this,opt)
		// test coll and model events
		this.model=params.model||this.model
		params.desc=params.desc+Date.now()
	}
}

return Row
