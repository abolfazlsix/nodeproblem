const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    text: { type: DataTypes.TEXT, allowNull: false }
  });
  return Comment;
};
