inherit('lib/View')
var css=require('List.css')
var List=function(coll,Row){
	List.__super__.constructor.call(this)
	this.coll=coll
	this.Row=Row
	this.rows=[]
}
var render=function(container,models,Row){
	var output=[]
	var ids=Object.keys(models)
	for(var i=0,k,m,r,el; k=ids[i]; i++){
		m=models[k]
		el=document.createElement('div')
		container.appendChild(el)
		r=new Row
		r.start(el,m)
		output.push(r)
	}
	return output
}

List.prototype={
	start:function(el,params){
		List.__super__.start.call(this,el,params,'list','<ul></ul>',css)
		this.coll=params.collection||this.coll
		this.Row=params.Row||this.Row

		this.coll.callback.on('update',function(){console.log('Coll.update',arguments)},this)
		this.coll.models[1].callback.on('field.update',function(){console.log('Model.update',arguments)},this)

		this.rows=render(el.getElementsByTagName('ul')[0],this.coll.models,this.Row)
	},
	stop:function(){
		this.coll.models[1].callback.off(null,null,this)
		this.coll.callback.off(null,null,this)
		for(var i=0,rs=this.rows,r; r=rs[i]; i++){
			r.stop()
		}
		this.rows.length=0
		List.__super__.stop.call(this,'list')
	}
}

return List
