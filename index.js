var express=require('express');
var app=express();

//测试动态加载
var fortunes=[
"Hello",
"My name is Mike",
"I love Node.js"
];



//加载handlebars模板引擎
var handlebars=require('express3-handlebars').create({defaultLayout:'main'});
app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

//设置端口
app.set('port',process.env.PORT||3000);
//设置静态文件处理路由
app.use(express.static(__dirname+'/public'));


app.get('/',function(req,res){
	res.render('home');
});
app.get('/about',function(req,res){
	var randomFortune=fortunes[Math.floor(Math.random()*fortunes.length)];

	res.render('About',{fortune:randomFortune});
});


//404 page
app.use(function(req,res){
	res.type('text/plain');
	res.status(404);
	res.send('404-Not Found');
});

//500 page
app.use(function(err,req,res,next){
	console.error(err.stack);
	res.render('500')
});

app.listen(app.get('port'),function(){
	console.log('Express started on http://localhost/:'+app.get('port')+"; press Ctrl+C to Stop!");
})




