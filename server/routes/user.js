const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } }); //db에서 팔로우할 사용자를 조회한다.
    await user.addFollowing(parseInt(req.params.id, 10)); //시퀄라이즈에서 추가한 addFollowing메서드로 현재 로그인한 사용자와의 관계를 지정한다.
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
}); //다른 사용자를 팔로우할 수 있는 라우터이다.

router.post('/:id/unfollow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } }); //db에서 팔로우할 사용자를 조회한다.
    await user.removeFollowing(parseInt(req.params.id, 10)); //시퀄라이즈에서 추가한 addFollowing메서드로 현재 로그인한 사용자와의 관계를 지정한다.
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
}); //다른 사용자를 팔로우할 수 있는 라우터이다.

router.post('/profile', async (req, res, next) => {
  try{
    await User.update({ nick: req.body.nick}, {
      where: { id: req.user.id },
    });
    res.redirect('/profile');
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;