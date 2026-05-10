import type { Task, User } from "./task-types";

export type DummyDb = {
  users: Map<string, User>; // by email
  passwords: Map<string, string>; // by email (plain-text for dummy)
  tasks: Map<string, Task[]>; // by userId
};

export const db: DummyDb = {
  users: new Map(),
  passwords: new Map(),
  tasks: new Map(),
};

export function getUserByEmail(email: string) {
  return db.users.get(email.toLowerCase());
}

export function createUser(email: string) {
  const id = crypto.randomUUID();
  const user: User = { id, email: email.toLowerCase() };
  db.users.set(user.email, user);
  db.tasks.set(user.id, []);
  return user;
}

export function addTaskForUser(userId: string, task: Task) {
  const list = db.tasks.get(userId) || [];
  list.push(task);
  db.tasks.set(userId, list);
}

export function getTasksForUser(userId: string) {
  return db.tasks.get(userId) || [];
}

