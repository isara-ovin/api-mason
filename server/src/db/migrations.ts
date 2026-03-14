import db from './connection';

const migrations = [
    `
  CREATE TABLE IF NOT EXISTS collections (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    raw_json      TEXT NOT NULL,
    parsed_data   TEXT NOT NULL,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  `,
    `
  CREATE TABLE IF NOT EXISTS environments (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    variables     TEXT NOT NULL,
    collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  `,
    `
  CREATE TABLE IF NOT EXISTS orchestrations (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT,
    flow_data       TEXT NOT NULL,
    collection_id   TEXT REFERENCES collections(id) ON DELETE SET NULL,
    environment_id  TEXT REFERENCES environments(id) ON DELETE SET NULL,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  `,
    `
  CREATE TABLE IF NOT EXISTS executions (
    id                TEXT PRIMARY KEY,
    orchestration_id  TEXT NOT NULL REFERENCES orchestrations(id) ON DELETE CASCADE,
    status            TEXT NOT NULL CHECK(status IN ('running','completed','failed','cancelled')),
    started_at        DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at      DATETIME,
    results           TEXT
  );
  `
];

export function runMigrations() {
    db.transaction(() => {
        for (const migration of migrations) {
            db.prepare(migration).run();
        }
    })();
    console.log('Migrations completed successfully');
}
