var organizations={
	init:function(name, opt){
		this.set([{
			id:1,
			name:'AAA',
			desc:'the tail of your dump file indicates that you have'
		},{
			id:2,
			name:'BBB',
			desc:'Try using forward slash'
		},{
			id:3,
			name:'CCC',
			desc:'When running this on a file that is'
		}],function(err){
			console.log('load orgs done',err)
		}, 1)
	}
}

return organizations
