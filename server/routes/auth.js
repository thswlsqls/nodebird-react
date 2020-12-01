const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const { User } = require('../models');

const router = express.Router();

router.post('/signup', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      req.flash('signupError', '이미 가입된 이메일입니다.');
      return res.redirect('/signup');
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.status(200).json({
        success: true
    })
  } catch (error) {
    console.error(error);
    return res.json({ success: false, error }) //next(error);
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      req.flash('loginError', info.message);
      return res.redirect('/');
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.status(200)
      .json({ loginSuccess: true, userId: user.id })
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

router.get('/logout', isLoggedIn, (req, res) => {
  console.log(req.session);
  req.logout();
  console.log(req.session);
  req.session.destroy();
  console.log(req.session);
  return res.status(200).json({ success: true }); 
  //res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao')); //layout.pug의 카카오톡 버튼에 붙어있는 주소이다.

router.get('/kakao/callback', passport.authenticate('kakao', { //GET /auth/kakao에서의 결과를 받아 로그인 전략을 수행한다.
  failureRedirect: '/login', //콜백 함수 대신에 실패시 이동할 경로를 전달한다.
}), (req, res) => {
  res.redirect('/'); //성공시 이동할 주소이다.
});

router.get('/kakao/callback', passport.authenticate('kakao', { //GET /auth/kakao에서의 결과를 받아 로그인 전략을 수행한다.
  failureRedirect: '/login', //콜백 함수 대신에 실패시 이동할 경로를 전달한다.
}), (req, res) => {
  res.redirect('/'); //성공시 이동할 주소이다.
}); 



module.exports = router;

