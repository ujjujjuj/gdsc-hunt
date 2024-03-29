const adminRoute = (instance, options, done) => {
  instance.addHook("preHandler", (request, reply, done) => {
    if (request.session.user === undefined) {
      return reply.redirect("/auth/login");
    }
    instance.db.get(
      "SELECT is_admin FROM users where id=?",
      [request.session.user],
      (err, user) => {
        if (!user.is_admin) {
          return reply.redirect("/");
        }
        done();
      }
    );
    done();
  });

  instance.get("/", (request, reply) => {
    instance.db.all("SELECT * from levels", (err, levels) => {
      instance.db.all("SELECT * from settings", (err, settings) => {
        reply.view("/views/admin.ejs", { levels, settings });
        done();
      })
    });
  });

  instance.post(
    "/new",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            id: { type: "integer", minimum: 0 },
            title: { type: "string", default: "" },
            text: { type: "string", default: "" },
            image: { type: "string", default: "" },
            comment: { type: "string", default: "" },
            answer: { type: "string" },
          },
          required: ["id", "answer"],
        },
      },
    },
    (request, reply) => {
      instance.db.run(
        "DELETE FROM levels WHERE id=?",
        [request.body.id],
        (err) => {
          instance.db.run(
            "INSERT INTO levels(id,title,text,image,comment,answer) VALUES(?,?,?,?,?,?)",
            [
              request.body.id,
              request.body.title,
              request.body.text,
              request.body.image,
              request.body.comment,
              request.body.answer,
            ],
            (e) => {
              return reply.send({ error: false });
            }
          );
        }
      );
    }
  );

  instance.post(
    "/delete",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            id: { type: "integer", minimum: 0 },
            title: { type: "string", default: "" },
            text: { type: "string", default: "" },
            image: { type: "string", default: "" },
            comment: { type: "string", default: "" },
            answer: { type: "string" },
          },
          required: ["id", "answer"],
        },
      },
    },
    (request, reply) => {
      instance.db.run(
        "DELETE FROM levels WHERE id=?",
        [request.body.id],
        (err) => {
          return reply.send({ error: false });
        }
      );
    }
  );

  instance.get("/logs", (request, reply) => {
    instance.db.all(
      "SELECT logs.id, team_name, attempt, timestamp, correct from logs, users where logs.team_id = users.id ORDER BY timestamp DESC",
      (e, logs) => {
        return reply.view("/views/logs.ejs", { logs });
      }
    );
  });

  instance.post("/toggle", (request, reply) => {
    instance.db.get(
      "SELECT val FROM settings WHERE key='isPaused'",
      (err, { val }) => {
        let newVal = "true";
        if (val.toLowerCase() === "true") {
          newVal = "false";
        }

        instance.db.run(
          "UPDATE settings SET val=? WHERE key='isPaused'",
          [newVal],
          (err) => {
            return reply.send({ error: false });
          }
        );
      }
    );
  });

  done();
};

module.exports = adminRoute;
