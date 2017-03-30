var head
var Callback=require('lib/Callback')
// src:https://raw.githubusercontent.com/krasimir/absurd/master/lib/processors/html/helpers/TemplateEngine.js
var compile=function(html,options){
	var re = /<%(.+?)%>/g, 
		reExp = /(^( )?(var|if|for|else|switch|case|break|{|}|;))(.*)?/g, 
		code = 'var r=[];\n', 
		cursor = 0, 
		result,
		match;
	var add = function(line, js) {
		js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
			(code += line != '' ? 'r.push("' + line.replace(/"/g, '\\"') + '");\n' : '');
		return add;
	}
	while(match = re.exec(html)) {
		add(html.slice(cursor, match.index))(match[1], true);
		cursor = match.index + match[0].length;
	}
	add(html.substr(cursor, html.length - cursor));
	code = (code + 'return r.join("");').replace(/[\r\t\n]/g, ' ');
	try { result = new Function('d', code).call(options, options); }
	catch(err) { console.error("'" + err.message + "'", " in \n\nCode:\n", code, "\n"); }
	return result;
}
var style=function(id,css){
	var ele=head.querySelector('#'+id)
	if (ele) return ele.dataset.rc=++ele.dataset.rc
	ele=document.createElement('style')
	ele.setAttribute('id',id)
	ele.dataset.rc=1
	ele.appendChild(document.createTextNode(css))
	head.appendChild(ele)
}
var unstyle=function(id){
	var ele=head.querySelector('#'+id)
	if (!ele) return
	var ds=ele.dataset
	ds.rc=ds.rc-1
	if (0==ds.rc) ele.parentNode.removeChild(ele)
}
var listen=function(ctx){
	var evts=ctx.events
	var domEvents=ctx.domEvents
	var el=ctx.el
	if (!evts) return
	var arr,eles,devts
	for(var evt in evts){
		arr=evt.split(' ',2)
		if (2!==arr.length) continue
		eles=el.querySelectorAll(arr[1])
		devts=domEvents[arr[0]]=domEvents[arr[0]]||[]
		devts.push([ctx,evts[evt],Array.prototype.slice.call(eles)])
		el.addEventListener(arr[0],ctx.onEvent,false)
	}
}
var unlisten=function(ctx){
	var el=ctx.el
	var domEvents=ctx.domEvents
	var list
	var keys=Object.keys(domEvents)
	for(var j=0,k; k=keys[j]; j++){
		list=domEvents[k]
		for(var i=0,l; l=list[i];){
			if (ctx===l[0]) list.splice(i,1)
			else i++
		}
		if (!list.length){
			el.removeEventListener(k,ctx.onEvent)
			delete domEvents[k]
		}
	}
}
var View=function(){
	this.el=null
	this.callback=new Callback
	var domEvents={}
	this.domEvents=domEvents
	this.onEvent=function(e){
		var devts=domEvents[e.type]
		if (!devts || !devts.length) return
		for(var i=0,d; d=devts[i]; i++){
			if (~d[2].indexOf(e.target)){
				d[1].call(d[0],e)
			}
		}
	}
}

this.load=function(){
	head=document.head || document.getElementsByTagName('head')[0]
}

View.prototype={
	start:function(el,params,name,html,css){
		this.el=el
		if (css)style(name,css)
		if (html)el.innerHTML=compile(html,params)
		listen(this)
	},
	stop:function(name){
		this.callback.off()
		unlisten(this)
		this.el.innerHTML=''
		unstyle(name)
	}
}

return View
