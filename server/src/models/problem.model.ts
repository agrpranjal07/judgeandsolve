import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database.js";
import User from "./user.model.js";

interface ProblemAttributes {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  sampleInput: string;
  sampleOutput: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy: string;
}

interface ProblemCreationAttributes
  extends Optional<ProblemAttributes, "id" | "createdAt" | "updatedAt"> {}

class Problem
  extends Model<ProblemAttributes, ProblemCreationAttributes>
  implements ProblemAttributes
{
  public id!: string;
  public title!: string;
  public description!: string;
  public difficulty!: "Easy" | "Medium" | "Hard";
  public sampleInput!: string;
  public sampleOutput!: string;
  public createdBy!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Problem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.ENUM("Easy", "Medium", "Hard"),
      allowNull: false,
    },
    sampleInput: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    sampleOutput: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "problems",
    modelName: "Problem",
  }
);

User.hasMany(Problem, { foreignKey: "createdBy", as: "problems" });
Problem.belongsTo(User, { foreignKey: "createdBy", as: "creator" });

export default Problem;
