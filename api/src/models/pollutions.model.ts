import { Sequelize, DataTypes, Model, Optional, ModelStatic } from 'sequelize'

// Champs alignés sur front/src/app/models/pollution.model.ts
export interface PollutionAttributes {
  id: number
  titre: string
  type: string
  description: string
  dateObservation: string
  lieu: string
  latitude: number
  longitude: number
  photoUrl: string | null
  indiceDangerosite: number
}

export interface PollutionCreationAttributes extends Optional<
  PollutionAttributes,
  'id' | 'photoUrl'
> {}

export interface PollutionInstance
  extends
    Model<PollutionAttributes, PollutionCreationAttributes>,
    PollutionAttributes {}

export type PollutionModel = ModelStatic<PollutionInstance>

export default function definePollutions(
  sequelize: Sequelize,
  _seq?: typeof Sequelize,
): PollutionModel {
  const Pollutions = sequelize.define<PollutionInstance>(
    'pollution',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      titre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      dateObservation: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      lieu: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      latitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      // URL http(s) ou image encodée en base64 (data URL) : TEXT car bien plus long qu'un VARCHAR(255).
      photoUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          is: /^(https?:\/\/\S+|data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+)$/,
        },
      },
      indiceDangerosite: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: { isInt: true, min: 0 },
      },
    },
    {
      tableName: 'pollution',
      freezeTableName: true,
      timestamps: false,
    },
  )

  return Pollutions
}
