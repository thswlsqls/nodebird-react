const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User } = require('../models');

const router = express.Router();

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', { title: '내 정보 - NodeBird', user: req.user });
});

router.get('/join', isNotLoggedIn, (req, res) => {
  console.log(req.body)
  res.render('join', {
    title: '회원가입 - NodeBird',
    user: req.user,
    joinError: req.flash('joinError'),
  });
});

router.get('/', (req, res, next) => {
  Post.findAll({
    include: [{
      model: User,
      attributes: ['id', 'nick'],
    }, {
      model: User,
      attributes: ['id', 'nick'],
      as: 'Liker',
    }],
    order: [['createdAt', 'DESC']],
  }) //db에서 게시글을 조회한다.
    .then((posts) => {
      console.log(posts);
      res.render('main', {
        title: 'NodeBird',
        twits: posts,
        user: req.user,
        loginError: req.flash('loginError'),
      });
    }) //결과를 twits에 넣어 렌더링한다.
    .catch((error) => {
      console.error(error);
      next(error);
    });
});

module.exports = router;