const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { User } = require('../models');

module.exports = (passport) => {
  passport.serializeUser((user, done) => { // req.session객체에 어떤 데이터를 저장할지 선택한다. user를 인자로 받아 done함수의 두번째 인자로 user.id를 넘겨준다. 용량과 데이터의 일관성 문제로 id만 저장한다.
    done(null, user.id);
  }); 

  passport.deserializeUser((id, done) => { // 매 요청시마다 passport.session()미들웨아가 호출한다. serializerUser에서 세션에 저장했던 아이디를 사용해 db에서 사용자 정보를 조회한다. req.user에 저장한다.
    User.findOne({ where: { id }, //세션에 저장된 id로 사용자 정보를 조회한다.
      include: [{
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers',
      }, {
        model: User,
        attributes: ['id', 'nick'], //비밀번호를 조회하지 못하도록 속성을 지정한다.
        as: 'Followings',
      }],
    }) //팔로워 목록과 팔로잉 목록을 조회한다.
      .then(user => done(null, user))
      .catch(err => done(err));
  });

  local(passport);
  kakao(passport);
};

