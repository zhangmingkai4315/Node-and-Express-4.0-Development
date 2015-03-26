var nodemailer=require('nodemailer');
module.exports=function(credentials){
	var mailTransport=nodemailer.createTransport({
	service:'QQ',
	auth:{
		user:credentials.gmail.user,
		pass:credentials.gmail.password
	}
    });

    var from='"Node\'s Site"<353873605@qq.com>';
    var errorRecipient='zhangmingkai.1989@gmail.com';
    return {
    	send:function(to,subject,body){
    		var mailOptions = {
			    from:from, // sender address
			    to:to, // list of receivers
			    subject:subject, // Subject line
			    html: body,
			    generateTextFromHtml:true // html body
			};

			mailTransport.sendMail(mailOptions, function(error, info){
			    if(error){
			        console.log(error);
			    }else{
			        console.log('Message sent: ' + info.response);
			    }
			});

    	},
    	emailError:function(message,filename,exception){
    		var body='<h1>'+message+'</h1>'+'<hr><p>'+exception+'</p>';
    		if(filename!=='')
    			body+="<strong>Filename:"+filename+"</strong>";
    		var erroremailOptions = {
			    from:from, // sender address
			    to:errorRecipient, // list of receivers
			    subject:'Error problem!', // Subject line
			    html: body,
			    generateTextFromHtml:true // html body
			};	

			mailTransport.sendMail(erroremailOptions, function(error, info){
			    if(error){
			        console.log(error);
			    }else{
			        console.log('Message sent: ' + info.response);
			    }
			});

    	}	
    };
};