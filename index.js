var express=require('express');
var app=express();
var Fortune=require('./lib/fortune.js');
var formidable=require('formidable');

//加载handlebars模板引擎
var handlebars=require('express3-handlebars')
.create({defaultLayout:'main',helpers:{
	section:function(name,options){
		if(!this._sections)
			this._sections={};
		this._sections[name]=options.fn(this);
		return null;
	}
}});

app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

//设置端口
app.set('port',process.env.PORT||3000);

//设置静态文件处理路由
app.use(express.static(__dirname+'/public'));
app.use(require('body-parser')());
//定义一个参数，当变量请求中包含query "test=1"时 将showTest设置为1
//改变header显示信息
app.use(function(req,res,next){
	res.locals.showTest=app.get('env')!=='production'&&req.query.test==='1';
	res.setHeader('x-powered-by','Laravel');
	next();
});
//对于天气的响应
function getWeatherData(){
	return {
		locations:[
		{
			name:'Portland',
			forecastUrl:'http://www.wunderground.com/US/OR/Portland.html',
			iconUrl:'http://icons-ak.wxug.com/i/c/k/cloudy.gif',
			weather:'Overcast',
			temp:'54.1F(12.3C)'
		},
		{
			name:'Bend',
			forecastUrl:'http://www.wunderground.com/US/OR/bend.html',
			iconUrl:'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
			weather:'Overcast',
			temp:'55.1F(12.3C)'
		},{
			name:'Manzanita',
			forecastUrl:'http://www.wunderground.com/US/OR/Manzanita.html',
			iconUrl:'http://icons-ak.wxug.com/i/c/k/rain.gif',
			weather:'Overcast',
			temp:'55.3F(12.3C)'
		},
		],
	};
}
//将变量装入locals中
app.use(function(req,res,next){
	if(!res.locals.partials)
		res.locals.partials={};
	res.locals.partials.weather=getWeatherData();
//	console.log(res.locals.partials);
	next();
});



app.get('/',function(req,res){
	res.render('home');
});

app.get('/testjquery',function(req,res){
	res.render('jquerytest');
})

app.get('/nursery-rhyme',function(req,res){
	res.render('jquerytest');
});
app.get('/data/nursery-rhyme',function(req,res){
	res.json({
		animal:'squirrel',
		bodyPart:'tail',
		adjective:'bushy',
		noun:'heck'
	});
});

app.get('/newsletter',function(req,res){
	res.render('newsletter',{csrf:'CSRF token goes here'});
});

app.post('/process',function(req,res){
     console.log(req.xhr);
     console.log(req.accepts);
	if(req.xhr||req.accepts('json,html')==='json'){
		res.send({sucess:true});
	}else{
		res.redirect(303,'/thank-you');
	}
	// console.log('Form:'+req.query.form);
	// console.log('CSRF:'+req.body._csrf);
	// console.log('Name:'+req.body.name);
	// console.log('Email'+req.body.email);
	// //303不会缓存，若是使用301永久重定向则可能会导致直接重定向。
	// res.redirect(303,'/thank-you');
});




//测试请求报文

// app.get('/header',function(req,res){
// 	res.set('Content-Type','text/plain');
// 	var s='';
// 	for(var name in req.headers) 
// 		{s+=name+':'+req.headers[name]+'\n';
// 		console.log(s);
// 		}
// 	res.send(s);
// });


var tours=[
{
	id:0,name:'Hood River',price:99.9
},
{
	id:1,name:'Oregon Coast',price:149.95
}];

// app.get('/api/tours',function(req,res){
// 	res.json(tours);
// });
//根据不同的请求返回不同数据
app.get('/api/tours',function(req,res){
	var toursXML='<?xml version="1.0"?><tours>'+tours.map(function(p){
		return '<tour price="'+p.price+'" id="'+p.id+'">'+p.name+'</tour>';
	}).join('')+'</tours>';
	var toursText=tours.map(function(p){
		return 'price="'+p.price+'" id="'+p.id+'" name='+p.name;
	}).join('\n');
    res.format({
    	'application/json':function(){
    		res.json(tours);
    	},
    	
    	'application/xml':function(){
    		res.type('application/xml');
    		res.send(toursXML);
    	},
    	
    		'text/xml':function(){
    			res.type('text/xml');
    			res.send(toursText);
    	},
    	
    		'text/plain':function(){
    			res.type('text/plain');
    			res.send(toursXML);
    	}
    	});
});

app.put('/api/tour/:id',function(req,res){
	var p=tours.some(function(p){
	return p.id=req.params.id;
	});
	if(p){
		if(req.query.name)p.name=req.query.name;
		if(req.query.price)p.price=req.query.price;
		res.json({sucess:true});
	}else{
		res.json({error:"No such tour exists"});
	}
});
app.delete('/api/tour/:id',function(req,res){
	var i;
	for(i=tours.length-1;i>=0;i--){
		if(tours[i].id==req.params.id)
			break;
	if(i>=0){
		tours.splice(i,1);
	    res.json({sucess:true});
	}else{
		res.json({error:'No Such tour exists'});
	}
  }
});





app.get('/about',function(req,res){
	res.render('About',{fortune:Fortune.getFortune(),pageTestScript:'/qa/tests-about.js'});
});

app.get('/tours/hood-river',function(req,res){
	res.render('tours/hood-river');
});

app.get('/tours/request-group-rate',function(req,res){
	res.render('tours/request-group-rate');
});
app.get('/contest/vacation-photo',function(req,res){
	var now=new Date();
	res.render('contest/vacation-photo',{
		year:now.getFullYear(),month:now.getMonth()
	});
});

app.post('/contest/vacation-photo/:year/:month',function(req,res){
	var form=new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		if(err) return res.redirect(303,'/error');
		console.log('received:'+fields+"\n received files:"+files);
		res.redirect(303,'/thank-you');
	});
});

//500 page
app.use(function(err,req,res,next){
	console.error(err.stack);
	res.status(500).render('500');
});
//404 page
app.use(function(req,res){
	res.type('text/plain');
	res.status(404);
	res.send('404-Not Found');
});

app.listen(app.get('port'),function(){
	console.log('Express started on http://localhost/:'+app.get('port')+"; press Ctrl+C to Stop!");
});






