var express=require('express');
var app=express();
var Fortune=require('./lib/fortune.js');
var formidable=require('formidable');
var credentials=require('./secure/credentials.js');
var http=require('http');
var fs=require('fs');
var vhost=require('vhost');






var routes=require('./routes.js')(app);
var emailService=require('./lib/email.js')(credentials);
//增加ssl支持,但是你的所有文件cdn加载也受限

// var https=require('https');
// var https_options={
// 	key:fs.readFileSync(__dirname+'/ssl/mingkai.pem'),
// 	cert:fs.readFileSync(__dirname+'/ssl/mingkai.crt'),
// };



//增加数据库的链接
var mongoose=require('mongoose');
var opts={
	server:{
		socketOptions:{keepAlive:1}
	}
};

var dataDir=__dirname+'/data';
var vacationPhotoDir=dataDir+'/vacation-photo';
fs.existsSync(dataDir)||fs.fs.mkdirSync(dataDir);
fs.existsSync(vacationPhotoDir)||fs.fs.mkdirSync(vacationPhotoDir);

function saveContestEntry(contestName,email,year,month,photoPath){
	//Todo---
}



		
//增加日志管理系统和启动数据库连接

switch(app.get('env')){
	case 'development':
	    var logFile=fs.createWriteStream(__dirname+'/log/requests.log', {flags:'a'});
		var mogan=require('morgan');
		app.use(mogan('combined',{stream:logFile}));
        mongoose.connect('mongodb://127.0.0.1/development_webdata',opts);
		
		break;
	case 'production':
		app.use(require('express-logger')({
			path:__dirname+'/log/requests.log'
		}));
		mongoose.connect('mongodb://127.0.0.1/production_webdata',opts);
		break;
	default:
		throw new Error('Unknown execution environment:'+app.get('env'));
}


//增加MVC支持

require('./controllers/customer.js').registerRoutes(app);

//设置静态文件处理路由
app.use(express.static('public'));
//初始化数据库数据：
var Vacation=require('./models/vacation.js');
Vacation.find(function(err,vacations){
	if(vacations.length) return;
	new Vacation({
		name:'Hood River',
		slug:'hood-river-day-trip',
		category:'Day-trip',
		sku:'HR199',
		description:'Send a day sailing on the columbia and enjoying craft beers in Hood river',
		priceInCents:9995,
		tags:['day-trip','hood river','sailing','windsurfing'],
		inSeason:true,
		maximumGuests:16,
		available:true,
		packageSold:0,
	}).save();
    new Vacation({
		name:'Red River',
		slug:'hood-river-day-trip',
		category:'Day-trip',
		sku:'HR200',
		description:'Send a day sailing on the columbia and enjoying craft beers in Hood river',
		priceInCents:4000,
		tags:['day-trip','red river'],
		inSeason:true,
		maximumGuests:16,
		available:true,
		packageSold:12,
	}).save();
    new Vacation({
		name:'Black River',
		slug:'hood-river-day-trip',
		category:'Day-trip',
		sku:'HR201',
		description:'Send a day sailing on the columbia and enjoying craft beers in Hood river',
		priceInCents:10000,
		tags:['day-trip','black river'],
		inSeason:false,
		maximumGuests:20,
		available:false,
		packageSold:0,
		notes:'The tour guide is recovering from a skiing accident',
	}).save();
});
var passport=require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User=require('./models/user');

app.use(require('cookie-parser')(credentials.cookieSecret));	
app.use(require('express-session')());
 app.use(passport.initialize());
 app.use(passport.session());



//认证支持



passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
     // console.log(user);
      if (err) {
        console.log(err.stack);
      	return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password!=password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
  	passport.serializeUser(function(user, done) {
 	 done(null, user._id);
	});
	passport.deserializeUser(function(id, done) {
  		 User.findById(id, function(err, user) {
        done(err, user);
      });
    });
      return done(null, user);
    });
  }
));
//增加针对CSRF攻击的防护

var csrf = require('csurf');
// app.use(require('csurf')());
// app.use(function(req,res,next){
// 	res.locals._csrfToken=req.csrfToken();
// 	next();
// });






app.use(function(req,res,next){
	res.locals.flash=req.session.flash;
	delete req.session.flash;
	next();
});

//加载handlebars模板引擎及section支持
var handlebars=require('express3-handlebars')
.create({defaultLayout:'main',
	helpers:{
	section:function(name,options){
		if(!this._sections)
			this._sections={};
		this._sections[name]=options.fn(this);
		return null;
	},
	static:function(name){
		return require('./lib/static.js').map(name);
	}

}});

app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

//设置端口
app.set('port',process.env.PORT||3000);





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

var Attraction=require('./models/attraction.js');

//增加用户登录页面
app.get('/login',function(req,res){
	res.render('login');
})


app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login'
   })
);



//增加跨源请求的

app.use('/api',require('cors')());

//创建子域名的处理

var admin=express.Router();
admin.get('/',function(req,res){
	res.render('admin/home');
});
admin.get('/users',function(req,res){
	res.render('admin/users');
});

app.use(vhost('admin.*',admin));




var api=express.Router();

api.get('/attractions',
function(req,res){
	Attraction.find({approved:true},
		function(err,attractions){
		if(err) 
			return res.send(500,"Error Occurred:database error");
		res.json(attractions.map(function(a){
			return {
				name:a.name,
				id:a._id,
				description:a.description,
				location:a.location,
			       };
			}));
	});
});



api.post('/attraction',function(req,res){

	var a=new Attraction({
		name:req.body.name,
		description:req.body.description,
		location:{
			lat:req.body.lat,
			lng:req.body.lng,
		},
		history:{
			event:'Created',
			email:req.body.email,
			date:new Date(),
		},
		approved:false,
	});
	a.save(function(err,a){
		if(err) 
			res.send(500,'Error found in connnecting database!');
		res.json({id:a._id});
	});
});



api.get('/attraction/:id',function(req,res){
	Attraction.findById(req.params.id,function(err,a){
		if(err)  res.send(500,'Error Occurred:database');
		res.json({
			name:a.name,
			description:a.description,
			id:a._id,
			location:a.location,
		});
	});
});


app.use(vhost('api.*',api));



// //增加一个游戏：有一定概率会刷出好玩的东西

// app.get('/',function(req,res,next){
// var winNumber=Math.random();
// console.log(winNumber);
// if(winNumber<0.01){
	
// 	res.send('Bingo! You win a lottary!');
// }
// else{
// 	next();
// }
// });

//只有读取过首页的用户 才能看到秘密！

// app.get('/secret',function(req,res,next){
// 	if(!req.session.authorized)
// 	res.send('Not-Authorized!');
// 	else{
// 		res.send('Secret!');
// 	}
	
// });

//使用正则表达式 匹配路径

app.get('/user(name)?',function(req,res){
	console.log(req.user);
	if(req.user===undefined)
		res.redirect(303,'/login');
	else{
		res.send('Hello! user')
	};
});

app.get('/staff/:city/:name',function(req,res){
	res.send('City:'+req.params.city+" Name:"+req.params.name);
})
app.get('/logout',function(req,res){
	//req.user=undefined;
	req.logout();
	res.send("Logout");
});
// 


app.get('/testjquery',function(req,res){
	res.render('jquerytest');
});			

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

var csrfProtection = csrf({ cookie: true });


app.get('/newsletter',csrfProtection,function(req,res){
	console.log(req.csrfToken());
	res.render('newsletter',{csrf:req.csrfToken()});
    
});

app.post('/process',function(req,res){
     console.log(req.xhr);
     console.log(req.accepts);
	if(req.xhr||req.accepts('json,html')==='json'){
		res.send({sucess:true});
	}else{
		res.redirect(303,'/thank-you');
	}
});
var VALID_EMAIL_REGEX= /^[\w+\-.]+@[a-z\d\-.]+\.[a-z]+$/i;
app.post('/newsletter',csrfProtection,function(req,res){
	var name=req.body.name||'';
	var email=req.body.email||'';
	console.log(name+email);
	    if(req.xhr) return res.json({success:true});
	    req.session.flash={
			type:'success',
			intro:'Thank you',
			message:'You have been signed up for the newsletter'
		};
        res.locals.flash=req.session.flash;

		//console.log(req.session.flash);
        return res.render('newsletter');
	
});


//关于mongo数据库中数据的展示：

app.get('/vacations',function(req,res){
	Vacation.find(function(err,vacations){
		var context={
			vacations:vacations.map(function(vacation){
				return {
					sku:vacation.sku,
					name:vacation.name,
					description:vacation.description,
					price:vacation.getDisplayPrice(),
					inSeason:vacation.inSeason,
				};
			})
		};
		res.render('vacations',context);
	});
});

var VacationInseasonListener=require("./models/vacationInSeasonListener.js");
app.get('/notify-me-when-in-season',function(req,res){
	res.render('notify-me-when-in-season',{sku:req.query.sku});
});

app.post('/notify-me-when-in-season',function(req,res){
	VacationInseasonListener.update(
	{
		email:req.body.email
	},
	{
		$push:{skus:req.body.sku}
	},
	{
		upsert:true
	},function(err){
		if(err){
			console.error(err.stack);
			req.session.flash={
				type:'danger',intro:'Opps',message:'There are some error happen!'
			};
			return res.redirect(303,'/vacations');
		}
		req.session.flash={
			type:'success',intro:'Thanks',message:'You will be notified when this vacation in season!'
		};
		return res.redirect(303,'/vacations');
	}
	)
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
	return 	p.id=req.params.id;
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

	emailService.send('353873605@qq.com','Hood.River','Hello world');
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
	form.uploadDir='./tmp';
	form.parse(req,function(err,fields,files){
		if(err) return res.redirect(303,'/error');
		if(err) {
			res.session.flash={
				type:'danger',
				intro:'Oops!',
				message:'There was an error processing your submission!'
			}
			return res.redirect(303,'/contest/vacation-photo');
		}
		var photo=files.photo;
		var dir=vacationPhotoDir+'/'+Date.now();
		var path=dir+'/'+photo.name;
		
		console.log(path);
        console.log(photo.path);

		fs.mkdirSync(dir);
		fs.renameSync(photo.path,path);
		saveContestEntry('vacation-photo',fields.email,req.params.year,req.params.month,path);
		req.session.flash={
			type:'success',
			intro:'GoodLuck',
			message:'You have been entered into the contest'
		}
		return res.redirect(303,'/contest/vacation-photo/entries');

	});
});


app.get('/cart/checkout',function(req,res){
	res.render('cart/register');
});

app.post('/cart/checkout',function(req,res,next){
	
	//if(!cart) next(new Error("Cart doesnot exists!"));
	var name=req.body.name||'',email=req.body.email||'';
	var cart={
		number:0,
		billing:{
			name:null,
			email:null
		}
	};
	cart.number=Math.random().toString().replace(/^0\.0*/,'');
	cart.billing={
		name:name,
		email:email
	};

	res.render('email/cart-thank-you',{
		layout:null,cart:cart},function(err,html){
			if(err) console.log("error in email: "+error);
			var mailOptions = {
			    from: 'Node.JS.info<353873605@qq.com>', // sender address
			    to: '353873605@qq.com', // list of receivers
			    subject: 'Booking infomation ✔', // Subject line
			    text: 'Thank for booking travel sercice ✔', // plaintext body
			    html: html,
			    generateTextFromHtml:true // html body
			};

			mailTransport.sendMail(mailOptions, function(error, info){
			    if(error){
			        console.log(error);
			    }else{
			        console.log('Message sent: ' + info.response);
			    }
			});
		}
	);
	res.render('cart-thanks-you',{cart:cart});
});

app.get('/fail',function(req,res){
   throw new Error('Nope!');
});

app.get('/epic-fail',function(req,res){
	process.nextTick(function(){
		throw new Error('Hello crash!');
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



// app.listen(app.get('port'),function(){
// 	console.log('Express started on http://localhost/:'+app.get('port')+"; press Ctrl+C to Stop!");
// 	console.log('Running in Env:'+app.get("env"));

// });

function startServer(){
	//var server=https.createServer(https_options,app).listen(app.get('port'),function(){
	var server=http.createServer(app).listen(app.get('port'),function(){
	console.log('Express started on http://localhost/:'+app.get('port')+"; press Ctrl+C to Stop!");
	console.log('Running in Env:'+app.get("env"));
	});
}
//当被其他脚本require时候，执行else 

if(require.main===module){
	startServer();
}else{
	module.exports=startServer;
}





