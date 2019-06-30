var ALL='*'

function off(slot, cb, ctx){
	if (!slot) return
	for(var i=0,s; (s=slot[i]); ){
		if ((!cb || cb===s[0]) && (!ctx || ctx===s[1])) slot.splice(i,1)
		else i++
	}
}

function Callback(){
	this.slots={}
	this.states={}
}

Callback.prototype = {
	on:function(key, cb, ctx){
		if (!cb) return
		var slot=this.slots[key] || []
		slot.push([cb,ctx])
		this.slots[key]=slot

		var args = this.states[key]
		if (args) this.trigger.apply(this, args)
	},
	off:function(key, cb, ctx){
		var slots=this.slots
		if (key){
			this.toggle(key, false)
			off(slots[key], cb, ctx)
		}else{
			this.states = {}
			for (key in slots){
				off(slots[key], cb, ctx)
			}
		}
	},
	trigger:function(key){
		var i,s
		var slot=this.slots[key]
		if (slot) for(i=0; (s=slot[i]); i++) s[0].apply(s[1], arguments)
		slot=this.slots[ALL]
		if (slot) for(i=0; (s=slot[i]); i++) s[0].apply(s[1], arguments)
	},
	toggle:function(key, state){
		if (state){
			var args = Array.prototype.slice.call(arguments, 2)
			this.states[key] = [key].concat(args)
			this.trigger(key)
		}else{
			this.states[key] = void 0
		}
	}
}

return Callback
