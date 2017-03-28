var View=inherit('lib/View')

var router=require('lib/router')
var html=require('Header.html')
var css=require('Header.css')

return {
	start:function(el,params){
		View.prototype.start.call(this,el,params,'header',html,css)
	},
	stop:function(){
		View.prototype.stop.call(this,'header')
	},
	events:{
		'click button':function(e){
			this.callback.trigger('click',e.target.textContent)
		}
	}
}
