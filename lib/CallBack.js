var CallBack=function(){
	this.slots={}
}
var off=function(slot, cb, ctx){
	if (!slot) return
	for(var i=0,s; s=slot[i]; ){
		if ((!cb || cb===slot[0]) && (!ctx || ctx===slot[1])) slot.splice(i,1)
		else i++
	}
}

CallBack.prototype={
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
		var slot=this.slots[key]
		if (!slot) return
		for(var i=0,s; s=slot[i]; i++){
			s[0].apply(s[1],Array.prototype.slice.call(arguments,1))
		}
	}
}

return CallBack
