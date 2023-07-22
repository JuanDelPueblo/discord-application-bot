import { Model, Column, Table, DataType } from 'sequelize-typescript';

@Table({ tableName: 'roles', timestamps: false })
export default class Role extends Model {
	@Column({ type: DataType.STRING, allowNull: false })
	declare form_channel_id: string;

	@Column({ type: DataType.JSON, allowNull: false })
	declare role_id: string;

	@Column({ type: DataType.STRING, allowNull: false, defaultValue: 'none' })
	declare permission: string;
}