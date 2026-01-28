import { connectDatabase, disconnectDatabase, orm } from './src/config/database';
import { User } from './src/models/User';
import { Todo, TodoStatus } from './src/models/Todo';
import { hashPassword } from './src/lib/password';
import { env } from './src/config/env';

async function createUsers() {
  await connectDatabase();
  const em = orm.em.fork();

  const users = env.credentials;

  for (const userData of users) {
    try {
      let user = await em.findOne(User, { username: userData.username });
      const fullName = userData.username === 'admin@todo.dev' ? 'Demo Admin' : 'Demo User';
      
      if (!user) {
        const hashedPassword = await hashPassword(userData.password);
        user = em.create(User, { ...userData, password: hashedPassword, fullName });
        await em.persistAndFlush(user);
        console.log(`Created user: ${userData.username}`);
      } else {
        user.fullName = fullName;
        await em.persistAndFlush(user);
        console.log(`User ${userData.username} already exists and was updated with fullName.`);
      }

      // Seed Todos for the regular user
      if (userData.username === 'user@todo.dev') {
        const filter: any = { 'user.$id': user._id };
        const todoCount = await em.count(Todo, filter);
        if (todoCount === 0) {
          const now = new Date();
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const in5Days = new Date(now);
          in5Days.setDate(in5Days.getDate() + 5);
          const in10Days = new Date(now);
          in10Days.setDate(in10Days.getDate() + 10);
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);

          const todos = [
            em.create(Todo, {
              title: "Learn React",
              description: "Understand components, hooks, and state management.",
              status: TodoStatus.COMPLETED,
              user: { $id: user._id, $ref: 'users' },
              due_date: yesterday,
              duration: "2h",
              created_at: now,
              updated_at: now
            }),
            em.create(Todo, {
              title: "Build a Project",
              description: "Create a full-stack application using React and Python.",
              status: TodoStatus.IN_PROGRESS,
              user: { $id: user._id, $ref: 'users' },
              due_date: tomorrow,
              duration: "5h",
              created_at: now,
              updated_at: now
            }),
            em.create(Todo, {
              title: "Master FastAPI",
              description: "Learn about dependency injection, Pydantic models, and async routes.",
              status: TodoStatus.PENDING,
              user: { $id: user._id, $ref: 'users' },
              due_date: in5Days,
              duration: "3h",
              created_at: now,
              updated_at: now
            }),
            em.create(Todo, {
              title: "Deploy App",
              description: "Deploy the application to a cloud provider like Azure or AWS.",
              status: TodoStatus.BACKLOG,
              user: { $id: user._id, $ref: 'users' },
              due_date: in10Days,
              duration: "1h",
              created_at: now,
              updated_at: now
            }),
          ];

          await em.persistAndFlush(todos);
          console.log(`Seeded ${todos.length} todos for user: ${userData.username}`);
        }
      }
    } catch (error) {
      console.error(`Error processing user ${userData.username}:`, error);
    }
  }

  await disconnectDatabase();
  console.log('Seed script completed.');
}

createUsers().catch(console.error);