import { Model, Column, Table, DataType, HasMany } from 'sequelize-typescript';
import Question from './Question.model.js';
import Role from './Role.model.js';
import Action from './Action.model.js';
import Application from './Application.model.js';


@Table({ tableName: 'forms', timestamps: false })
export default class Form extends Model {
	@Column({ type: DataType.STRING, primaryKey: true })
	declare form_channel_id: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare title: string;

	@Column({ type: DataType.STRING, allowNull: true })
	declare description: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare button_text: string;

	@Column({ type: DataType.STRING, allowNull: true })
	declare embed_message_id: string;

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
	declare enabled: boolean;

	@Column({ type: DataType.INTEGER, allowNull: true })
	declare max: number;

	@HasMany(() => Question, 'form_channel_id')
	declare question: Awaited<Question[]>;

	@HasMany(() => Role, 'form_channel_id')
	declare role: Awaited<Role[]>;

	@HasMany(() => Action, 'form_channel_id')
	declare action: Awaited<Action[]>;

	@HasMany(() => Application, 'form_channel_id')
	declare application: Awaited<Application[]>;

}