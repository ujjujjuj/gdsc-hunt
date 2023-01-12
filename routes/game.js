const gameRoute = (instance, options, done) => {
  instance.addHook("preHandler", (request, reply, done) => {
    if (request.session.user === undefined) {
      return reply.redirect("/auth/login");
    }
    instance.db.get(
      "SELECT level FROM users where id=?",
      [request.session.user],

      (err, user) => {
        instance.db.get(
          "SELECT * FROM levels WHERE id=?",
          [user.level],
          (err, data) => {
            request.session.level = data;
            done();
          }
        );
      }
    );
  });

  instance.get("/", (request, reply) => {
    reply.view("/views/play.ejs", {
      username: request.session.user,
      level: request.session.level,
    });
  });
  instance.post(
    "/",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            answer: { type: "string" },
          },
          required: ["answer"],
        },
      },
    },
    (request, reply) => {
      instance.db.run(
        "INSERT into logs(username,attempt,correct,timestamp) VALUES(?,?,?,?)",
        [
          request.session.user,
          request.body.answer,
          request.body.answer === request.session.level.answer,
          Date.now(),
        ]
      );
      if (request.body.answer === request.session.level.answer) {
        instance.db.run(
          "UPDATE users SET level=?, last_answered=? WHERE id=?",
          [request.session.level.id + 1, Date.now(), request.session.user]
        );
        reply.send({ error: false });
      } else {
        reply.send({ error: true });
      }
    }
  );
  done();
};

module.exports = gameRoute;
