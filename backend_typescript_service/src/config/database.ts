import { MikroORM } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { env } from './env';
import { User } from '../models/User';
import { Todo } from '../models/Todo';

export let orm: MikroORM<MongoDriver>;

export async function connectDatabase(): Promise<void> {
  try {
    orm = await MikroORM.init<MongoDriver>({
      metadataProvider: TsMorphMetadataProvider,
      entities: [User, Todo],
      clientUrl: env.mongoUri,
      dbName: env.mongoDb,
      type: 'mongo',
    });
    console.log('Connected to MongoDB via MikroORM');
  } catch (error) {
    console.error('MikroORM connection error:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (orm) {
    await orm.close();
    console.log('Disconnected from MongoDB');
  }
}
