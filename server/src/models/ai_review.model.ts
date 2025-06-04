import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
import User from "./user.model.js";
import Problem from "./problem.model.js";

export default class AIReview extends Model {
  public id!: string;
  public userId!: string;
  public problemId!: string;
  public reviewText!: string;
  public rating!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AIReview.init(
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
        model: "users",
        key: "id",
      },
    },
    problemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "problems",
        key: "id",
      },
    },
    reviewText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ai_reviews",
    modelName: "AIReview",
    indexes: [
      {
        unique: true,
        fields: ["userId", "problemId"],
      },
    ],
  }
);

// Associations
AIReview.belongsTo(User, { foreignKey: "userId", as: "user" });
AIReview.belongsTo(Problem, { foreignKey: "problemId", as: "problem" });
User.hasMany(AIReview, { foreignKey: "userId", as: "aiReviews" });
Problem.hasMany(AIReview, { foreignKey: "problemId", as: "aiReviews" });
