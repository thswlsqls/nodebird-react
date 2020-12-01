const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
  config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require('./user')(sequelize, Sequelize);
db.Post = require('./post')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);

db.User.hasMany(db.Post);
db.Post.belongsTo(db.User); // user모델과 post모델이 1:N관계에 있다. 시퀄라이즈가 post모델에 userId컬럼을 추가한다.

db.Post.belongsToMany(db.Hashtag, { through: 'PostHashtag' });
db.Hashtag.belongsToMany(db.Post, { through: 'PostHashtag' }); //post모델과 hashtag모델은 N:M관계에 있다. 시퀄라이즈가 PostHashtag테이블을 생성한다. PostId, HashtagId를 컬럼으로 갖는다. post데이터는 getHashtags, addHashtags 메서드가, hashtag데이터에는 getPosts, addPosts메서드가 추가된다.

db.User.belongsToMany(db.User, { 
  foreignKey: 'followingId',
  as: 'Followers',
  through: 'Follow',
});
db.User.belongsToMany(db.User, {
  foreignKey: 'followerId',
  as: 'Followings', //join연산에 사용하는 이름이다. 이를 바탕으로 시퀄라이즈가 getFollowings, gwtfollwers, addFollowing, addFollower메서드를 수행한다.
  through: 'Follow',
}); //user모델과 user모델이 N:M관계에 있다. 시퀄라이즈가 follow모델을 생성한다. followerid, followingid를 컬럼으로 갖는다.

db.User.belongsToMany(db.Post, { through: 'Like' });
db.Post.belongsToMany(db.User, { through: 'Like', as: 'Liker' });

module.exports = db;