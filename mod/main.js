var pStr=pico.export('pico/str')
pico.run({
	name: 'main',
	ajax:__.ajax,
	onLoad: __.onload,
	preprocessors:{
		'.asp':function(url,asp){ return pStr.template(asp) }
	},
	paths:{
			'~': 'mod/',
			root: './',
			lib: 'lib/'
	}
},function(){
	var router=require('lib/router')
	var Collection=require('lib/Collection')
	var pages={
		organizations:{panes:['organizations']},
		users:{panes:['users']}
	}
	var home=pages['organizations']
	var oldPanes=[]
	var requireAll=function(reqs,idx,output,cb){
		if (reqs.length<=idx) return cb(null,output)
		require(reqs[idx++],function(err,mod){
			if (err) return cb(err)
			output.push(mod)
			requireAll(reqs,idx,output,cb)
		})
	}
	var pageChanged=function(params){
		var page=params?pages[params.page]||home:home
		requireAll(page.panes,0,[],function(err, panes){
			if (err) return console.error(err)
			for(var i=0,p; p=oldPanes[i]; i++){
				if (!p || p===panes[i]) continue
				p.stop()
			}
			oldPanes=panes
			for(var i=0,p; p=panes[i]; i++){
				if (p) p.start({el:'#pane'+i},params)
			}
		})
	}

	return function(){
		router.on('change',pageChanged)
		router.start()
	}
})
