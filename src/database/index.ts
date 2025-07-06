import path from "path"
import Database from "bun:sqlite"
import { getMigrations, migrate } from "bun-sqlite-migrations"

const databaseFactory = () => {
  const db = new Database(path.resolve(process.cwd(), "data", "sunshine.db"), { create: true })
  migrate(db, getMigrations(path.resolve(process.cwd(), "data", "migrations")))
  return db
}

export const db = databaseFactory()
