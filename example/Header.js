var Module=inherit('po/Module')
var tmpl=require('Header.asp')
var css=require('Header.css')

return {
	start:function(opt,params){
		opt.content=tmpl(params)
		Module.prototype.start.call(this,opt,css)
	},
	events:{
		'click button':function(e){
			this.callback.trigger('click',e.target.textContent)
		}
	}
}
