(function(module,exports,require){
var
dummyCB=function(){},
dummyLoader=function(){arguments[arguments.length-1]()},
dummyAmd={run:dummyCB,inherit:dummyCB,querystring:dummyCB,ajax:dummyCB},//TODO: proxy
modules={},
updates={},
EXT_JS='.js',EXT_JSON='.json',
DEF="amd.define('URL','FUNC')\n",
MOD_PREFIX='"use strict";\n',
MOD_POSTFIX='//# sourceURL=',
PLACE_HOLDER='return arguments.callee.__proto__.apply(this,arguments)',
paths={},
schedule= (function(){
	return ('undefined'===typeof requestAnimationFrame) ? function(cb){ return setTimeout(cb, 100) }: requestAnimationFrame
})(),
funcBody=function(func){
    return func.substring(func.indexOf('{')+1,func.lastIndexOf('}'))
},
getExt=function(url){
    if (!url)return null
    var idx=url.lastIndexOf('.')
    return -1!==idx && -1===url.indexOf('/',idx) ? url.substr(idx) : null
},
// link to all deps
linker=function(deps, cb){
    if (!deps.length) return cb()
    loader(deps.shift(),function(err){
        if (err) return cb(err)
        linker(deps, cb)
    })
},
// load files, and execute them based on ext
loader=function(url,cb){
    if (modules[url])return cb(null, modules[url])

    var
    symbolIdx=url.indexOf('/'),
    path=paths[-1===symbolIdx?url : url.substr(0,symbolIdx)]

    if (!path){
        symbolIdx=-1
        path=paths['*']||''
    }

    var fname=-1===symbolIdx?url : url.substr(symbolIdx+1)

    if (path instanceof Function){
        path(fname, function(err, m){
            if (err) return cb(err)
            modules[url]=m
            cb(null, m)
        })
    }else{
        amd.ajax('get',path+fname+(getExt(url)?'':EXT_JS),null,null,function(err,state,txt){
            if (err) return cb(err)
            if (4!==state) return
			js(url,txt,cb)
        })
    }
},
placeHolder=function(url){
	return Object.defineProperty(Function(PLACE_HOLDER), 'name', { value: url })
},
inherit=function(child,ancestor){
	var isFunc='function'===typeof child
	switch(typeof ancestor){
	case 'function':
		var fn=isFunc ? child : function(){return ancestor.apply(this,arguments)}
		Object.assign(fn,ancestor)
		var fnp=fn.prototype=Object.assign(Object.create(ancestor.prototype),isFunc?child.prototype:child)
		fnp.constructor=fn
		var cs=child.__super__=ancestor.prototype
		cs.constructor=ancestor
		return fn
	case 'object':
		isFunc?child.prototype=ancestor:child.__proto__=ancestor
	default: return child
	}
},
getMod=function(url,cb){
    var mod=modules[url]
    if(mod){
        if (cb)setTimeout(cb, 0, null, mod) // make sure consistent async behaviour
        return mod
    }
    if (cb) return loader(url,cb)
    return modules[url]=placeHolder(url)
},
// do not run the module but getting the deps and inherit
compile=function(url,txt,deps,base,me){
    me=me||dummyAmd
    var
    script=url ? MOD_PREFIX+txt+MOD_POSTFIX+url : txt,
    frequire=function(k){if(!modules[k])deps.push(k);return modules[k]},
    inherit=function(k){base.unshift(k),frequire(k)}

    try{ var func=Function('exports','require','module','define','inherit','amd',script) }
    catch(e){return console.error(url, e.message)}
	
    func.call({}, {},frequire,{},dummyCB,inherit,me)
    return func
},
// run the module and register the module output
define=function(url, func, base, mute){
    var ext=getExt(url)||EXT_JS

    switch(ext){
    case EXT_JS:
        var
        module={exports:{}},
        evt={},
        m=func.call(mute?{}:evt,module.exports,getMod,module,define,getMod,amd)||module.exports

        if (base)m=inherit(m,base)

        if(evt.load)evt.load(m)
        if ('function'===typeof evt.update)updates[url]=[evt.update,m]

        if (!url) return m

        var o=modules[url]

        if(o){
            o.prototype=m.prototype
            o.__proto__=m
            return modules[url]=o
        }
        return modules[url]=m
    case EXT_JSON:
        try{ return modules[url]=JSON.parse(func) }
        catch(e){return console.error(url, e.message)}
    default: return modules[url]=func
    }
},
// js file executer
js=function(url,txt,cb){
    cb=cb||dummyCB
    if(modules[url]) return cb(null, modules[url])
	if(EXT_JS !== (getExt(url)||EXT_JS)) return cb(null, define(url,txt))

    var
    deps=[],
    base=[],
    func=compile(url,txt,deps,base)

    if(url)modules[url]=placeHolder(url)

    linker(deps, function(err){
        if (err) return cb(err)
        
        cb(null,define(url,func,modules[base[0]]))
    })
},
tick=function(timestamp){
	schedule(tick)
	for(var i=0,keys=Object.keys(updates),f; f=updates[keys[i]]; i++){
		f[0](f[1],timestamp)
	}
}

var amd=module[exports]={
    run:function(options,func){
        paths=options.paths||paths

        ;(options.onLoad||dummyLoader)(function(){
            js(options.name||null,funcBody(func.toString()),function(err,main){
                if (err) return console.error(err)

                if (main) main()

				schedule(tick)
            })
        })
    },
	inherit:inherit,
	querystring: function(obj){
		return Object.keys(obj).reduce(function(a,k){a.push(encodeURIComponent(k)+'='+encodeURIComponent(obj[k]));return a},[]).join('&')
	},
    // method: get/post,
	// url: path, 
	// params: null/parameters (optional),
	// opt: {responseType,async,un,passwd,headers} (optional),
	// cb: callback(err, state, res, userData),
	// userData: optional
    ajax: function(method, url, params, opt, cb, userData){
        cb=cb || function(err){if(err)console.error(err)} 
        if (!url) return cb('url not defined')
        opt=opt||{}

        var
        xhr = new XMLHttpRequest(),
        post = 'POST' === (method = method.toUpperCase()),
        dataType = ('string' === typeof params ? 1 : (params instanceof FormData ? 3 : 2))

        url = encodeURI(url)

        if (!post){
            url += -1===url.indexOf('?')?'?':'&'
            if (params){
                url += '&'
                switch(dataType){
                case 1: url += encodeURIComponent(params); break
                case 2: url += amd.querystring(params); break
                case 3: return cb('FormData with GET method is not supported yet')
                }
                params = null
            }
        }

        xhr.open(method, url, undefined===opt.async?true:opt.async, opt.un, opt.passwd)

		xhr.timeout=opt.timeout||0
		xhr.responseType=opt.responseType||''

        xhr.onreadystatechange=function(){
            if (1 < xhr.readyState){
                var st = xhr.status, loc
                if (st>=300 && st<400 && (loc=xhr.getResponseHeader('location'))) return amd.ajax(method,loc,params,opt,cb,userData)
                return cb((300>st || !st) ? null : {error:xhr.statusText,code:xhr.status},xhr.readyState,xhr.response,userData)
            }
        }
        xhr.ontimeout=xhr.onerror=function(evt){
			cb({error:xhr.statusText,code:xhr.status,params:arguments}, xhr.readyState, null, userData)
		}
        if (post && params && 3 !== dataType) xhr.setRequestHeader('Content-Type', 'text/plain')
        var h=opt.headers
        for (var k in h) xhr.setRequestHeader(k, h[k])

        switch(dataType){
        case 1: xhr.send(params); break
        case 2: xhr.send(JSON.stringify(params)); break
        case 3: xhr.send(params); break
        }
		return xhr
    }
}
}).apply(null, [window, 'amd'])
