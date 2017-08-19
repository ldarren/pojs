pico.run({
	name: 'main',
	ajax:__.ajax,
	onLoad: __.onload,
	preprocessors:{
		'.asp':function(url,asp){ return pico.export('pico/str').template(asp) }
	},
	paths:{
		'~': './',
		po: '../lib/'
	}
},function(){
	var router=require('po/router')
	var page
	function requireAll(reqs,idx,output,cb){
		if (reqs.length<=idx) return cb(null,output)
		require(reqs[idx++],function(err,mod){
			if (err) return cb(err)
			output.push(mod)
			requireAll(reqs,idx,output,cb)
		})
	}
	function pageChanged(evt, state, params){
		if (page) page.stop()
		requireAll(state?[state]:['organizations'],0,[],function(err,mods){
			if (err) return console.error(err)
			page=mods[0]
			page.start({el:document.body})
		})
	}

	return function(){
		router.on('change',pageChanged).start({organizations:'organizations','users/u:id':'users'})
	}
})
