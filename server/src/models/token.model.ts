import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
import User from "./user.model.js";

export default class Token extends Model {
  public id!: string;
  public userId!: string;
  public refreshToken!: string;
  public userAgent!: string | null;
  public ipAddress!: string | null;
  public expiresAt!: Date;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Token.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userAgent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "tokens",
    sequelize,
  }
);

// Define the association
User.hasMany(Token, {
  foreignKey: "userId",
  as: "tokens",
});

Token.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});
