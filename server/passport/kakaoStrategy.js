const KakaoStrategy = require('passport-kakao').Strategy;

const { User } = require('../models');

module.exports = (passport) => {
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_ID, //카카오에서 발급해주는 id이다.
    callbackURL: '/api/auth/kakao/callback', //카카오로부터 인증결과를 받을 라우터 주소이다.
  }, async (accessToken, refreshToken, profile, done) => { //카카오에서 인증 후에 accessToken, refreshToken, profile을 위 주소로 보낸다.
    try {
      const exUser = await User.findOne({ where: { snsId: profile.id, provider: 'kakao' } });
      if (exUser) { //기존에 kakao로 로그인한 사용자가 있다면 done함수를 호출한다.
        done(null, exUser);
      } else {
        const newUser = await User.create({ 
          email: profile._json && profile._json.kaccount_email,
          nick: profile.displayName,
          snsId: profile.id,
          provider: 'kakao',
        }); //카카오로부터 받은 profile에 사용자 정보들이 들어있다. 원하는 정보들을 꺼내와서 회원가입을 한다. 사용자를 생성하고 done함수를 호출한다.
        done(null, newUser);
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};
