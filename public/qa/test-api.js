var assert=require('chai').assert;
var http=require('http');
var rest=require('restler');

suite('API tests',function(){
	var attraction={
		lat:45.516011,
		lng:-122.682062,
		name:'Portland Art Museum',
		description:'Founed in 1982,the portland art museus\'s collection of native art is not to be missed.',
		email:'Test@gmail.com',
		approved:true,
	};
var base='http://localhost:3000';
test('should be able to add an attraction',function(done){
		rest.post(base+'/api/attraction',{data:attraction}).on('success',function(data){
			assert.match(data.id,/\w/,'id must be set');
			done();
		});
	});


var attraction1={
		lat:415.516011,
		lng:122.682062,
		name:'USA Art Museum',
		description:'Founed in 1982,the portland art museus\'s collection of native art is not to be missed.',
		email:'Test@gmail.com',
		approved:true,
	};
test('should be able to retrieve an attraction',function(done){
		rest.get(base+'/api/attraction/55178162fa4a65f307f44d4a').on('success',function(data){
			
				done();
		
		});
	});

});