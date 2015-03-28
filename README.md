使用时请按照以下步骤进行：

1. npm install 

2. 创建secure目录并增加credentials.js文件：
格式如下：
modele.exports={
	cookieSecret:'你自己的秘钥串';
};


3.如需要添加二级域名 比如 ：admin.localhost:3000  

请将/etc/hosts文件中加入 ：
127.0.0.1    admin.localhost

并通过 vhost 添加入其他路由之前 ！