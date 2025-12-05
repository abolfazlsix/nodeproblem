const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, unique: true, allowNull: false }, // آیدی یکتا (انگلیسی)
    firstName: { type: DataTypes.STRING },
    lastName: { type: DataTypes.STRING },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    avatar: { type: DataTypes.STRING }, // path to uploaded image
    interactionsCount: { type: DataTypes.INTEGER, defaultValue: 0 } // برای مدال
  });
  return User;
};
