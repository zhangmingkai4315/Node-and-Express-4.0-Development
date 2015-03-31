var mongoose=require('mongoose');

var userSchema=mongoose.Schema({
	username:String,
	password:String,
	registerTime:Date,
	updateDate:Date,
	email:String

});
var User=mongoose.model('User',userSchema);
module.exports=User;
if(require.main == module){
	var opts={
	
	};
	 mongoose.connect('mongodb://127.0.0.1/development_webdata',opts);
    new User({
    	username:'test',
    	password:'123456',
    }).save(function(err){
    	if(err) console.log('save fail!')
    	console.log('save success!');
    });

  
}
