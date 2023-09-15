import { Model, Column, Table, DataType, HasMany } from 'sequelize-typescript';
import Answer from './Answer.model.js';



@Table({ tableName: 'applications', timestamps: false })
export default class Application extends Model {
	@Column({ type: DataType.STRING, allowNull: false })
	declare form_channel_id: string;

	@Column({ type: DataType.STRING, allowNull: false, primaryKey: true })
	declare thread_id: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare user_id: string;

	@Column({ type: DataType.BOOLEAN, allowNull: false })
	declare submitted: boolean;

	@Column({ type: DataType.DATE, allowNull: true })
	declare submitted_at: Date;

	@Column({ type: DataType.BOOLEAN, allowNull: true })
	declare approved: boolean;

	@HasMany(() => Answer, 'thread_id')
	declare answer: Awaited<Answer[]>;
}