var Customer=require('../models/customer.js');


module.exports=function(customerId){
	var customer=Customer.findById(customerId);
	if(!customer) return{
		error:'UNKNOWN CUSTOMER ID:'+req.params.customerId
	};
	//定义一些数据格式化的工作

}