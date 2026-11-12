import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";

export interface UserAttributes {
  id: number;
  login: string;
  password: string;
  lastName: string;
  firstName: string;
  email: string;
}

export interface UserCreationAttributes extends Optional<UserAttributes, "id"> {}

export interface UserInstance
  extends Model<UserAttributes, UserCreationAttributes>,
    UserAttributes {}

export type UserModel = ModelStatic<UserInstance>;

export default function defineUsers(sequelize: Sequelize): UserModel {
  return sequelize.define<UserInstance>(
    "user",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { notEmpty: true }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
      }
    },
    {
      tableName: "users",
      freezeTableName: true,
      timestamps: false
    }
  );
}
