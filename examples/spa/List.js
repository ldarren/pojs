var Module=inherit('po/Module')
var html=require('List.html')
var css=require('List.css')
var List=function(coll,Row){
	List.prototype.constructor.call(this)
	this.coll=coll
	this.Row=Row
	this.rows=[]
}
var populate=function(container,models,Row){
	var output=[]
	var ids=Object.keys(models)
	for(var i=0,k,m,r; (k=ids[i]); i++){
		m=models[k]
		r=new Row
		r.start({},m)
		container.appendChild(r.el)
		output.push(r)
	}
	return output
}

List.prototype={
	start:function(opt,params){
		opt.content=html
		opt.style={List:css}
		Module.prototype.start.call(this,opt)
		this.coll=params.collection||this.coll
		this.Row=params.Row||this.Row

		this.coll.callback.on('update',function(){
			// eslint-disable-next-line
			console.log('Coll.update',arguments)
		},this)
		this.coll.models[1].callback.on('field.update',function(){
			// eslint-disable-next-line
			console.log('Model.update',arguments)
		},this)

		this.rows=populate(this.el.getElementsByTagName('ul')[0],this.coll.models,this.Row)
	},
	stop:function(){
		this.coll.models[1].callback.off(null,null,this)
		this.coll.callback.off(null,null,this)
		for(var i=0,rs=this.rows,r; (r=rs[i]); i++){
			r.stop()
		}
		this.rows.length=0
		Module.prototype.stop.call(this)
	}
}

return List
