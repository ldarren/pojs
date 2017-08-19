var Module=inherit('po/Module')
var html=require('Header.html')
var self
function onEvent(){self.callback.trigger('click')}

return {
	start:function(opt,params){
		opt.content=html.replace('COUNT',params.leftText)
		Module.prototype.start.call(this,opt)
		self = this
		this.el.addEventListener('click',onEvent)
	},
	stop:function(){
		this.el.removeEventListener('click',onEvent)
		self = void 0
		Module.prototype.stop.call(this)
	}
}
