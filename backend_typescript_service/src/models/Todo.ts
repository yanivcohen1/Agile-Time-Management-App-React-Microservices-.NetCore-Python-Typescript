import { Entity, PrimaryKey, Property, Enum, ManyToOne } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { User } from './User';

export enum TodoStatus {
  BACKLOG = 'BACKLOG',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity({ collection: 'todos' })
export class Todo {
  @PrimaryKey()
  _id!: ObjectId;

  @Property()
  title!: string;

  @Property({ nullable: true })
  description?: string;

  @Enum(() => TodoStatus)
  status: TodoStatus = TodoStatus.BACKLOG;

  @Property({ nullable: true })
  duration?: string;

  @Property({ nullable: true })
  due_date?: Date;

  @Property()
  created_at: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updated_at: Date = new Date();

  @Property()
  user!: { $id: ObjectId; $ref: string };
}
