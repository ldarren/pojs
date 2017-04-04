var
setId=function(el,id){
	if (id) el.id=id
},
setClasses=function(cl,classNames){
	if (classNames) cl.add.apply(cl,classNames)
},
setAttributes=function(el,attributes){
	if (attributes) for(var k in attributes) el.setAttribute(k,attributes[k])
},
setChilds=function(el,childs){
	if (!childs) return
	if ('string'===typeof childs){
		el.innerHTML=childs
	}else{
		for(var i=0,c; c=childs[i]; i++) el.appendChild(c)
	}
}

return {
	setId:setId,
	setClasses:setClasses,
	setAttributes:setAttributes,
	setChilds:setChilds,
	get:function(opt){
		if (!opt) return
		var el=opt.el
		if (el){
			if ('string'===typeof el) el=document.querySelector(el)
		}else{
			var el=document.createElement(opt.tagName || 'div')
		}
		setId(el,opt.id)
		setClasses(el.classList,opt.classNames)
		setAttributes(el,opt.attributes)
		setChilds(el,opt.childs)

		return el
	}
}
