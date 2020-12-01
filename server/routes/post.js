const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag, User } = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

fs.readdir('uploads', (error) => {
  if (error) {
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
    fs.mkdirSync('uploads');
  }
}); //fs을 사용하여 uploads폴더가 있는지 검사하고 없으면 mkdirSync메서드를 사용하여 폴더를 생성한다.

const upload = multer({ //upload는 미들웨어를 만드는 객체가 된다. storage, limits속성을 갖는다.
  storage: multer.diskStorage({ //파일 저장 방식이다. 이미지가 서버디스크에 저장된다. 
    destination(req, file, cb) { //파일 저장 경로이다.
      cb(null, 'uploads/'); //uploads폴더에 저장한다.
    },
    filename(req, file, cb) { //파일 이름이다.
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext); //기존 파일명에 업로드 날짜와 확장자를 붙여 저장한다.
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, //최대 이미지 파일용량 허용치이다.
});

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => { //single메서드에 이미지가 담긴 req.body속성의 이름을 적어준다. ajax이미지 전송시 속성이름을 img로 한다. upload.single미들웨어가 이를 처리하고 req.file객체에 저장한다.
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` }); //게시글 등록시 사용할 filename을 client에게 보낸다.
}); //이미지 업로드를 처리하는 라우터이다.

const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      userId: req.user.id,
    }); //게시글을 db에 저장한다.
    const hashtags = req.body.content.match(/#[^\s#]*/g); //게시글 내용에서 해시태그를 정규표현식으로 추출한다.
    if (hashtags) {
      const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
        where: { title: tag.slice(1).toLowerCase() },
      }))); //추출한 해시태그를 db에 저장한다.
      await post.addHashtags(result.map(r => r[0])); //게시글과 해시태그의 관계를 PostHashtag테이블에 넣는다.
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});//게시글 업로드를 처리하는 라우터이다.

router.delete('/:id', async (req, res, next) => {
  try {
    await Post.destroy({ where: { id: req.params.id, userId: req.user.id }});
    res.send('OK');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get('/hashtag', async (req, res, next) => { //해시태그로 조회하는 라우터이다.
    const query = req.query.hashtag; //쿼리스트링으로 해시태그 이름을 받는다.
    if (!query) {
      return res.redirect('/'); //해시태그가 빈 문자열인 경우 메인페이지로 돌려보낸다.
    }
    try {
      const hashtag = await Hashtag.findOne({ where: { title: query } }); //db에서 해당하는 해시태그가 있는지 조사한다.
      let posts = [];
      if (hashtag) {
        posts = await hashtag.getPosts({ include: [{ model: User }] });//해시태그가 있다면 시퀄라이즈가 제공하는 getPosts메서드로 모든 게시글을 가져온다. 가져올 때, 작성자 정보를 join한다.
      }
      return res.render('main', {
        title: `${query} | NodeBird`,
        user: req.user,
        twits: posts,
      }); //메인페이지를 렌더링하면서 전체 게시글 대신 조회된 게시글만 렌더링한다.
    } catch (error) {
      console.error(error);
      return next(error);
    }
  });
  
  router.post('/:id/like', async (req, res, next) => {
    try {
      const post = await Post.findOne({ where: { id: req.params.id }});
      await post.addLiker(req.user.id);
      res.send('OK');
    }catch (error) {
      console.error(error);
      next(error);
    }
  });

  router.delete('/:id/like', async (req, res, next) => {
    try {
      const post = await Post.findOne({ where: { id: req.params.id }});
      await post.removeLiker(req.user.id);
      res.send('OK');
    }catch (error) {
      console.error(error);
      next(error);
    }
  });

module.exports = router;