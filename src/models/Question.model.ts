import { Model, Column, Table, DataType, BeforeDestroy } from 'sequelize-typescript';
import Answer from './Answer.model.js';

@Table({ tableName: 'questions', timestamps: false })
export default class Question extends Model {
	@Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
	declare question_id: number;

	@Column({ type: DataType.STRING, allowNull: false })
	declare form_channel_id: string;

	@Column({ type: DataType.INTEGER, allowNull: false })
	declare order: number;

	@Column({ type: DataType.STRING, allowNull: false })
	declare title: string;

	@Column({ type: DataType.STRING, allowNull: true })
	declare description: string;

	@Column({ type: DataType.STRING, allowNull: false })
	declare type: string;

	@Column({ type: DataType.BOOLEAN, allowNull: false })
	declare required: boolean;

	@Column({ type: DataType.INTEGER, allowNull: true })
	declare min: number;

	@Column({ type: DataType.INTEGER, allowNull: true })
	declare max: number;

	@Column({ type: DataType.JSON, allowNull: true })
	declare options: string[];

	@BeforeDestroy
	static async deleteAnswers(question: Question) {
		await Answer.destroy({ where: { question_id: question.question_id } });
	}
}
