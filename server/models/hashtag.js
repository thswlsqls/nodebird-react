module.exports = (sequelize, DataTypes) => (
    sequelize.define('hashtag', {
      title: { // 태크이름을 저장한다. 태그로 검색하기 위함이다.
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
      },
    }, {
      timestamps: true, // createAt, updatedAt, deletedAt 컬럼이 생성된다.
      paranoid: true,
    })
  );
  