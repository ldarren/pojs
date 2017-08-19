var Module=inherit('po/Module')
var html=require('Header.html')
var self
function onEvent(){self.callback.trigger('click')}

return {
	start:function(opt,params){
		opt.content=html
		Module.prototype.start.call(this,opt)
		self=this
		this.el.onclick=onEvent
	//setTimeout(function(self){self.callback.trigger('click')},4000,this)
	/*},
	events:{
		'click button':function(e){
			this.callback.trigger('click',e.target.textContent)
		}*/
	},
	stop:function(){
		self = void 0
		this.el.onclick=void 0
		Module.prototype.stop.call(this)
	}
}
