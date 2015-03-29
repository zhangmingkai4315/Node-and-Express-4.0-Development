var Customer=require('../models/customer.js');

module.exports={
	registerRoutes:function(app){
		app.get('/customer/:id',this.home);
		app.get('/customer/:id/preferences',this.preferences);
	},
	home:function(req,res,next){
		//var customer=Customer.findById(req.params.id);
		//if(!customer) return next();
		Customer.find(function(err,customers){
			var information={
				customers:customers.map(function(customer){
					return{
						firstName:customer.firstName,
						lastName:customer.lastName,
					}
				})
			};
			console.log(information);
			res.render('customer/home',information);
		});
	},
	preferences:function(req,res,next){
		var customer=Customer.findById(req.params.id);
		console.log(customer.firstName);
		if(!customer) return next();
		res.render('customer/home',customer);
	},
};