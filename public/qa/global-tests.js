suite('Global Tests',function(){
	test('Page has avalid title',function(){
		assert(document.title&&document.title.match(/\S/)&&document.title.toUpperCase()!=='TODO');
	});
});

