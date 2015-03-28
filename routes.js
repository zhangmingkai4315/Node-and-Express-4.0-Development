var main=require('./routerHandlers/main.js');
module.exports=function(app){
	app.get('/',main.home);
	app.get('/',main.about);
};