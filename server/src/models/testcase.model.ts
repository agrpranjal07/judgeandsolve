import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database.js";
import Problem from "./problem.model.js";

interface TestcaseAttributes {
  id: string;
  problemId: string;
  input: string;
  output: string;
  isSample: boolean;
}

interface TestcaseCreationAttributes
  extends Optional<TestcaseAttributes, "id"> {}

class Testcase
  extends Model<TestcaseAttributes, TestcaseCreationAttributes>
  implements TestcaseAttributes
{
  public id!: string;
  public problemId!: string;
  public input!: string;
  public output!: string;
  public isSample!: boolean;
}

Testcase.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    problemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Problem,
        key: "id",
      },
    },
    input: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    output: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    isSample: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "testcases",
    modelName: "Testcase",
  }
);

Problem.hasMany(Testcase, { foreignKey: "problemId", as: "testcases" });
Testcase.belongsTo(Problem, { foreignKey: "problemId", as: "problem" });

export default Testcase;
