'use strict';

let userAuthor = require('./userAuthor');

module.exports.list = function* () {
  yield this.bindDefault();
  if (!userAuthor.checkAuth(this, this.userInfo)) {return};

  let pageNum = this.query.page;

  let PostModel = this.mongo('Post');
  let posts = yield PostModel.page(pageNum,20);
  let page = yield PostModel.count(pageNum,20);

  yield this.render('dashboard/post_list',{
    breads : ['文章管理','文章列表'],
    posts:posts,
    userInfo: this.userInfo,
    siteInfo: this.siteInfo
  })
}


module.exports.aj_post_delete = function* (){
  yield this.bindDefault();
  if (!userAuthor.checkAuth(this, this.userInfo)) {return};

  let id = this.request.body.id;
  let result = {code:0,message:''};

  let PostModel = this.mongo('Post');
  let CateModel = this.mongo('Category');

  let post = yield PostModel.deletePost(id);

  if(!post){
    result.code = 1;
    result.message = '文章不存在！';
    
    this.body = result;
    return;
  }

  if(post.category){
    let cate = yield CateModel.numbMinus(post.category);

    this.body = result;
    return;
  }else{
    this.body = result;
    return;
  }
};
module.exports.aj_post_delete.__method__ = 'post';

module.exports.aj_edit = function* (){
  yield this.bindDefault();
  if (!userAuthor.checkAuth(this, this.userInfo)) {return};

  let data = this.request.body;
  let is_new = data.is_new;
  let author = data.author || userInfo.id;
  let category = data.category;
  let result = {code:0,message:''};

  if(!this.siteInfo.cates_item || !this.siteInfo.cates_item[category]){
    result.code = 3;
    result.message = '没有找到对应的文章分类';
    this.body = result;
    return;
  }


  let PostModel = this.mongo('Post',{
    id: data.id,
    title: data.title,
    image: data.image,
    from: data.from,
    author: data.author,
    content: data.content,
    htmlContent: data.htmlContent,
    introContent: data.introContent,
    category: data.category
  });

  let doc = yield PostModel.getPostById(data.id);

  if(is_new == 1 && doc){
    result.code = '1';
    result.message = '文章已经存在，请勿重复添加！';

    this.body = result;
    return;
  }else if(is_new == 0 && !doc){
    result.code = '2';
    result.message = '文章不存在，无法编辑！';

    this.body = result;
    return;
  }

  let res = yield PostModel.edit( is_new );

  if(is_new == 1){
    yield this.mongo('Category').numbAdd( data.category );    
  }

  this.body = result;
}
module.exports.aj_edit.__method__ = 'post';


module.exports.edit = function* () {
  yield this.bindDefault();
  if (!userAuthor.checkAuth(this, this.userInfo)) {return};

  let post;
  let post_id = this.query.id;

  if(post_id){
    post = yield this.mongo('Post').getPostById(post_id);
    if(!post){
      this.body = '文章不存在';
      return;
    }
  }

  yield this.render('dashboard/post_edit',{
    isNew: !post_id,
    breads : ['文章管理',(!post_id ? '新文章':'编辑文章')],
    post:post,
    userInfo: this.userInfo,
    siteInfo: this.siteInfo
  })
}


module.exports.aj_cate_delete = function* (){
  yield this.bindDefault();
  if (!userAuthor.checkAuth(this, this.userInfo)) {return};

  let id = this.request.body.id;
  let result = {code:0,message:''};

  let CateModel = this.mongo('Category');

  let cate = yield CateModel.deleteCate(id);

  if(!cate){
    result.code = 1;
    result.message = '分类不存在！'; 
  }else if(cate.numb > 0){
    result.code = 2;
    result.message = '该分类下还有文章，请删除后再试'; 
  }

  this.body = result;
  return;
};
module.exports.aj_cate_delete.__method__ = 'post';


module.exports.aj_cate_edit = function* (){
  yield this.bindDefault();
  if (!userAuthor.checkAuth(this, this.userInfo)) {return};
  
  let data = this.request.body;
  let is_new = data.is_new;
  let result = {code:0,message:''};

  let CateModel = this.mongo('Category',{
    id: data.id,
    name: data.name,
    numb: data.numb
  });

  let doc = yield CateModel.getCategoryById(data.id);

  if(is_new == 1 && doc){
    result.code = '1';
    result.message = '分类已经存在，请勿重复添加！';

    this.body = result;
    return;
  }else if(is_new == 0 && !doc){
    result.code = '2';
    result.message = '该分类不存在，无法编辑！';

    this.body = result;
    return;
  }

  let res = yield CateModel.edit( is_new );

  this.body = result;
}
module.exports.aj_cate_edit.__method__ = 'post';

module.exports.cate = function* () {
  yield this.bindDefault();
  if (!userAuthor.checkAuth(this, this.userInfo)) {return};

  yield this.render('dashboard/post_cate',{
    breads : ['文章管理','分类管理'],
    userInfo: this.userInfo,
    siteInfo: this.siteInfo
  })
}