const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Post = sequelize.define('Post', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    image: { type: DataTypes.STRING },
    category: { type: DataTypes.STRING, allowNull: false }, // "problems", "war_damage", "normal", "volunteer", "donation"
    contact: { type: DataTypes.STRING } // برای volunteer/donation شماره تماس
  });
  return Post;
};
