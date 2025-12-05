const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const Like = sequelize.define('Like', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true }
  });
  return Like;
};
