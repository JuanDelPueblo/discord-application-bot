import { Model, Column, Table, DataType } from 'sequelize-typescript';

@Table({ tableName: 'actions', timestamps: false })
export default class Action extends Model {
	@Column({ type: DataType.STRING, allowNull: false })
	declare form_channel_id: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare name: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare when: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare do: string;

	@Column({ type: DataType.STRING, allowNull: true })
	declare role_id: string;

	@Column({ type: DataType.STRING, allowNull: true })
	declare message_channel_id: string;

	@Column({ type: DataType.STRING, allowNull: true })
	declare message: string;

	@Column({ type: DataType.STRING, allowNull: true })
	declare reason: string;
}