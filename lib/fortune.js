//测试动态加载
var fortunes=[
"Hello",
"My name is Mike",
"I love Node.js"
];

exports.getFortune=function(){

	var idx=Math.floor(Math.random()*fortunes.length);
	return fortunes[idx];
};