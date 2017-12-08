var Module=inherit('po/Module')
var tmpl=require('Header.asp')
var css=require('Header.css')

return {
	start:function(opt,params){
		opt.content=tmpl(params)
		opt.styles = { default: css }
		Module.prototype.start.call(this,opt)
	},
	events:{
		'click button':function(e, target){
			this.callback.trigger('click',target.textContent)
		}
	}
}
