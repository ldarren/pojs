var ALL='*'
var Callback=function(){
	this.slots={}
}
var off=function(slot, cb, ctx){
	if (!slot) return
	for(var i=0,s; (s=slot[i]); ){
		if ((!cb || cb===s[0]) && (!ctx || ctx===s[1])) slot.splice(i,1)
		else i++
	}
}

Callback.prototype={
	on:function(key, cb, ctx){
		if (!cb) return
		var slot=this.slots[key] || []
		slot.push([cb,ctx])
		this.slots[key]=slot
	},
	off:function(key, cb, ctx){
		var slots=this.slots
		if (key){
			off(slots[key], cb, ctx)
		}else{
			for (key in slots){
				off(slots[key], cb, ctx)
			}
		}
	},
	trigger:function(key){
		var i,s
		var slot=this.slots[key]
		if (slot) for(i=0; (s=slot[i]); i++) s[0].apply(s[1],arguments)
		slot=this.slots[ALL]
		if (slot) for(i=0; (s=slot[i]); i++) s[0].apply(s[1],arguments)
	}
}

return Callback
