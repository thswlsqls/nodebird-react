module.exports = (sequelize, DataTypes) => (
    sequelize.define('user', {
      email: {
        type: DataTypes.STRING(40),
        allowNull: true,
        unique: true,
      },
      nick: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      provider: { // local이면 로컬로그인, kakao이면 kakao로그인을 한 것이다.
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'local',
      },
      snsId: { //sns 로그인 시 저장한다.
        type: DataTypes.STRING(30),
        allowNull: true,
      },
    }, {
      timestamps: true, //createdAt, updatedAt, deletedAt컬럼이 생성된다.
      paranoid: true,
    })
  );