var mongoose=require('mongoose');
var customerSchema=mongoose.Schema({
	firstName:String,
	lastName:String,
	email:String,
	address:String,
	city:String,
	zip:String,
	phone:String,
	salesNotes:[{
		date:Date,
		salesPersonId:Number,
		notes:String
	}],
});

var Customer=mongoose.model('Customer',customerSchema);
module.exports=Customer;

if(require.main == module){
	var opts={
	
	};
	 mongoose.connect('mongodb://127.0.0.1/development_webdata',opts);
    new Customer({
    	firstName:'Hill',
    	lastName:'Strong',
    	email:'Hs@gmail.com',
    	address:'Beijing',
    	city:'Beijing',
    	zip:'100010',

    }).save(function(err){
    	if(err) console.log('save fail!')
    	console.log('save success!');
    });

  
}