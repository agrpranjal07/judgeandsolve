import { DataTypes, Model } from "sequelize";
import { sequelize } from "../config/database.js";
import Problem from "./problem.model.js";
import Tag from "./tag.model.js";

class ProblemTag extends Model {
  public problemId!: string;
  public tagId!: string;
}

ProblemTag.init(
  {
    problemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Problem,
        key: "id",
      },
      primaryKey: true,
    },
    tagId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Tag,
        key: "id",
      },
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: "problem_tags",
    modelName: "ProblemTag",
    timestamps: false,
  }
);

Problem.belongsToMany(Tag, {
  through: ProblemTag,
  foreignKey: "problemId",
  as: "tags",
});
Tag.belongsToMany(Problem, {
  through: ProblemTag,
  foreignKey: "tagId",
  as: "problems",
});

export default ProblemTag;
