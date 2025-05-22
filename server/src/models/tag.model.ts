import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database.js";

interface TagAttributes {
  id: string;
  name: string;
}

interface TagCreationAttributes extends Optional<TagAttributes, "id"> {}

class Tag
  extends Model<TagAttributes, TagCreationAttributes>
  implements TagAttributes
{
  public id!: string;
  public name!: string;
}

Tag.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "tags",
    modelName: "Tag",
  }
);

export default Tag;
