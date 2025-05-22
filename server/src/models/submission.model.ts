import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';
import User from './user.model.js';
import Problem from './problem.model.js';

interface SubmissionAttributes {
  id: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  reviewNote?: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  verdict: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error' | 'Internal Error' | 'Skipped' | 'Unknown';
  createdAt?: Date;
  updatedAt?: Date;
}

interface SubmissionCreationAttributes extends Optional<SubmissionAttributes, 'id' | 'createdAt' | 'updatedAt' | 'reviewNote'> {}

class Submission extends Model<SubmissionAttributes, SubmissionCreationAttributes> implements SubmissionAttributes {
  public id!: string;
  public userId!: string;
  public problemId!: string;
  public code!: string;
  public language!: string;
  public reviewNote?: string;
  public status!: 'Pending' | 'Running' | 'Completed' | 'Failed';
  public verdict!: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compilation Error' | 'Internal Error' | 'Skipped' | 'Unknown';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Submission.init(
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
        key: 'id',
      },
    },
    problemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Problem,
        key: 'id',
      },
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reviewNote: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Running', 'Completed', 'Failed'),
      allowNull: false,
    },
    verdict: {
      type: DataTypes.ENUM('Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Internal Error', 'Skipped', 'Unknown'),
      allowNull: false,
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
    tableName: 'submissions',
    modelName: 'Submission',
  }
);

User.hasMany(Submission, { foreignKey: 'userId', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Problem.hasMany(Submission, { foreignKey: 'problemId', as: 'submissions' });
Submission.belongsTo(Problem, { foreignKey: 'problemId', as: 'problem' });

export default Submission; 