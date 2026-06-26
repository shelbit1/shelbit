import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import type { Deal, DealStage, DealPriority } from "@/types/crm";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "crm.db");

let db: Database.Database | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function initSchema(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      address TEXT NOT NULL,
      price REAL NOT NULL,
      manager_id INTEGER,
      manager_name TEXT NOT NULL,
      stage TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium',
      object_type TEXT,
      region TEXT,
      yield_percent REAL,
      payback_years REAL,
      area_sqm REAL,
      tenants TEXT,
      owner TEXT,
      deadline TEXT,
      close_probability INTEGER DEFAULT 10,
      rejection_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      stage_changed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deal_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deal_id INTEGER NOT NULL,
      user_id INTEGER,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      detail TEXT,
      from_stage TEXT,
      to_stage TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deal_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deal_id INTEGER NOT NULL,
      user_id INTEGER,
      user_name TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS deal_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deal_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      due_date TEXT,
      completed INTEGER DEFAULT 0,
      assignee_name TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (deal_id) REFERENCES deals(id) ON DELETE CASCADE
    );
  `);
}

type DealRow = {
  id: number;
  title: string;
  address: string;
  price: number;
  manager_id: number | null;
  manager_name: string;
  stage: string;
  priority: string;
  object_type: string | null;
  region: string | null;
  yield_percent: number | null;
  payback_years: number | null;
  area_sqm: number | null;
  tenants: string | null;
  owner: string | null;
  deadline: string | null;
  close_probability: number;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  stage_changed_at: string;
  comment_count?: number;
};

export function mapDealRow(row: DealRow): Deal {
  return {
    id: row.id,
    title: row.title,
    address: row.address,
    price: row.price,
    managerId: row.manager_id,
    managerName: row.manager_name,
    stage: row.stage as DealStage,
    priority: row.priority as DealPriority,
    objectType: row.object_type,
    region: row.region,
    yieldPercent: row.yield_percent,
    paybackYears: row.payback_years,
    areaSqm: row.area_sqm,
    tenants: row.tenants,
    owner: row.owner,
    deadline: row.deadline,
    closeProbability: row.close_probability,
    rejectionReason: row.rejection_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    stageChangedAt: row.stage_changed_at,
    commentCount: row.comment_count ?? 0,
  };
}

function seedIfEmpty(database: Database.Database) {
  const userCount = database
    .prepare("SELECT COUNT(*) as c FROM users")
    .get() as { c: number };

  if (userCount.c === 0) {
    const username = process.env.ADMIN_USERNAME || "admin";
    const password = process.env.ADMIN_PASSWORD || "Hamankgo1";
    const hash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();

    database
      .prepare(
        "INSERT INTO users (username, password_hash, role, name, created_at) VALUES (?, ?, ?, ?, ?)"
      )
      .run(username, hash, "admin", "Администратор", now);
  }
}

/** Однократно удаляет демо-заявки, созданные при первоначальной настройке. */
function purgeDemoData(database: Database.Database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  const row = database
    .prepare("SELECT value FROM app_meta WHERE key = 'demo_purged'")
    .get() as { value: string } | undefined;

  if (row?.value === "1") return;

  const demoTitles = [
    "Пятёрочка",
    "Магнит",
    "Fix Price",
    "ВкусВилл",
    "DNS",
    "Лента",
    "СберМаркет",
  ];

  for (const title of demoTitles) {
    database.prepare("DELETE FROM deals WHERE title = ?").run(title);
  }

  database.prepare("DELETE FROM users WHERE username = 'ivanov'").run();

  database
    .prepare("INSERT OR REPLACE INTO app_meta (key, value) VALUES ('demo_purged', '1')")
    .run();
}

/** Обновляет пароль admin из переменной окружения (важно при смене пароля на сервере). */
function syncAdminPassword(database: Database.Database) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return;

  const username = process.env.ADMIN_USERNAME || "admin";
  const hash = bcrypt.hashSync(password, 10);
  database
    .prepare("UPDATE users SET password_hash = ? WHERE username = ?")
    .run(hash, username);
}

export function getDb(): Database.Database {
  if (db) return db;
  ensureDataDir();
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema(db);
  seedIfEmpty(db);
  syncAdminPassword(db);
  purgeDemoData(db);
  return db;
}

export function verifyUser(username: string, password: string) {
  const database = getDb();
  const user = database
    .prepare("SELECT id, username, password_hash, role, name FROM users WHERE username = ?")
    .get(username) as
    | {
        id: number;
        username: string;
        password_hash: string;
        role: string;
        name: string;
      }
    | undefined;

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role as "admin" | "manager",
    name: user.name,
  };
}
