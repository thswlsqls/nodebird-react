const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const { User } = require('../models');

module.exports = (passport) => {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password', //req.body의 일치하는 속성명을 적어준다.
  }, async (email, password, done) => { //LocalStrategy의 두번째 인자이다. done함수는 passport.authenticate의 콜백함수이다. 
    try {
      const exUser = await User.findOne({ where: { email } }); //사용자 db에서 email정보를 찾는다.
      if (exUser) {
        const result = await bcrypt.compare(password, exUser.password); //password를 비교한다.
        if (result) {
          done(null, exUser); //비밀번호가 일치하면, 사용자 정보를 넣어보낸다.
        } else {
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
      } else {
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      } //done함수의 첫번째 인자는 서버에러시, 두번째 인자는 로그인 성공시, 세번째 인자는 로그인 실패시 사용한다.
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};
