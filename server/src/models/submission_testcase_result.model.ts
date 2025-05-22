import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import Submission from './submission.model.js';
import Testcase from './testcase.model.js';

interface SubmissionTestcaseResultAttributes {
  id: string;
  submissionId: string;
  testcaseId: string;
  passed: boolean;
  runtime: number;
  memory: number;
}

interface SubmissionTestcaseResultCreationAttributes extends Optional<SubmissionTestcaseResultAttributes, 'id'> {}

class SubmissionTestcaseResult extends Model<SubmissionTestcaseResultAttributes, SubmissionTestcaseResultCreationAttributes> implements SubmissionTestcaseResultAttributes {
  public id!: string;
  public submissionId!: string;
  public testcaseId!: string;
  public passed!: boolean;
  public runtime!: number;
  public memory!: number;
}

SubmissionTestcaseResult.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    submissionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Submission,
        key: 'id',
      },
    },
    testcaseId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Testcase,
        key: 'id',
      },
    },
    passed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    runtime: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    memory: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'submission_testcase_results',
    modelName: 'SubmissionTestcaseResult',
  }
);

Submission.hasMany(SubmissionTestcaseResult, { foreignKey: 'submissionId', as: 'testcaseResults' });
SubmissionTestcaseResult.belongsTo(Submission, { foreignKey: 'submissionId', as: 'submission' });
Testcase.hasMany(SubmissionTestcaseResult, { foreignKey: 'testcaseId', as: 'submissionResults' });
SubmissionTestcaseResult.belongsTo(Testcase, { foreignKey: 'testcaseId', as: 'testcase' });

export default SubmissionTestcaseResult; 