import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { UserRole } from '../config/env';

@Entity({ collection: 'users' })
export class User {
  @PrimaryKey()
  _id!: ObjectId;

  @Property({ type: 'string', fieldName: 'email' })
  @Unique()
  username!: string;

  @Property({ type: 'string', fieldName: 'password_hash' })
  password!: string;

  @Property({ type: 'string' })
  role!: UserRole;

  @Property({ type: 'string', fieldName: 'full_name', nullable: true })
  fullName?: string;
}
