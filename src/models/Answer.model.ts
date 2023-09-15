import { Model, Column, Table, DataType, BelongsTo } from 'sequelize-typescript';
import Question from './Question.model.js';
import Application from './Application.model.js'

type AnswerContent = {
	type: string;
	content: string | number | string[];
}

@Table({ tableName: 'answers', timestamps: false })
export default class Answer extends Model {
	@Column({ type: DataType.STRING, allowNull: false })
	declare thread_id: string;

	@Column({ type: DataType.INTEGER, allowNull: false })
	declare question_id: number;

	@Column({ type: DataType.JSON, allowNull: false })
	declare answer: AnswerContent;

	@BelongsTo(() => Question, 'question_id')
	declare question: Awaited<Question>;

	@BelongsTo(() => Application, 'thread_id')
	declare application: Awaited<Application>;
}