const sqlite3 = require("sqlite3").verbose();
const { hashPassword } = require("../utils");
const fp = require("fastify-plugin");

const dbPlugin = (instance, options, done) => {
  const db = new sqlite3.Database("data.db");

  instance.decorate("db", db);
  db.all(
    "select name from sqlite_master where type='table'",
    async (err, rows) => {
      if (rows.find((row) => row.name === "users") !== undefined) {
        done();
      } else {
        
        db.exec(
          `
        PRAGMA foreign_keys = ON;

        CREATE TABLE levels(
          id INTEGER NOT NULL PRIMARY KEY,
          text TEXT,
          image TEXT,
          comment TEXT,
          answer TEXT NOT NULL
        );
        CREATE TABLE users(
          id TEXT NOT NULL PRIMARY KEY,
          is_admin BOOLEAN DEFAULT FALSE,
          password TEXT NOT NULL,
          level INTEGER DEFAULT 0,
          last_answered INTEGER DEFAULT 0,
          roll_number TEXT
        );
        CREATE TABLE logs(
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL,
          attempt TEXT NOT NULL,
          correct BOOLEAN NOT NULL,
          FOREIGN KEY(username) references users(id)
        );
        
        INSERT INTO users(id, password, is_admin) values(
          '${process.env.ADMIN_USER ?? "admin"}',
          '${await hashPassword(process.env.ADMIN_PASSWORD ?? "password")}',
          TRUE
        )
        `,
          (e) => {
            if (e) {
              console.error(e);
              return;
            }

            console.log("Seeded database successfully");
            done();
          }
        );
      }
    }
  );
};

module.exports = fp(dbPlugin);
