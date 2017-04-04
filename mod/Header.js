var View=inherit('lib/View')

var router=require('lib/router')
var tmpl=require('Header.asp')
var css=require('Header.css')

return {
	start:function(opt,params){
		opt.css=css
		opt.childs=View.exec(tmpl,params)
		View.prototype.start.call(this,opt)
	},
	stop:function(){
		View.prototype.stop.call(this)
	},
	events:{
		'click button':function(e){
			this.callback.trigger('click',e.target.textContent)
		}
	}
}
