pico.run({
	name: 'main',
	ajax:__.ajax,
	onLoad: __.onload,
	preprocessors:{
		'.asp':function(url,asp){
			return pico.export('pico/str').template(asp)
		}
	},
	paths:{
		'~': './',
		po: '../../lib/'
	}
},function(){
	var router=require('po/router')
	var pages={
		organizations:{panes:['organizations']},
		users:{panes:['users']}
	}
	var home=pages['organizations']
	var oldPanes=[]
	function requireAll(reqs,idx,output,cb){
		if (reqs.length<=idx) return cb(null,output)
		require(reqs[idx++],function(err,mod){
			if (err) return cb(err)
			output.push(mod)
			requireAll(reqs,idx,output,cb)
		})
	}
	function pageChanged(evt, state, params){
		var page=pages[state]||home
		for(var i=0,p; (p=oldPanes[i]); i++){
			p.stop()
		}
		requireAll(page.panes,0,[],function(err, panes){
			if (err) return console.error(err)
			oldPanes=panes
			for(var i=0,p; (p=panes[i]); i++){
				p.start({el:'#pane'+i},params)
			}
		})
	}

	return function(){
		router.on('change',pageChanged).start({organizations:'organizations','users/u:id':'users'})
	}
})
