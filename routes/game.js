const gameRoute = (instance, options, done) => {
  instance.addHook("preHandler", (request, reply, done) => {
    if (!request.session.user) {
      reply.redirect("/auth/login");
    }
    instance.db.get(
      "SELECT level FROM users where id=?",
      [request.session.user],
      (err, lvl) => {
        instance.db.get(
          "SELECT * FROM level WHERE id=?",
          [lvl],
          (err,
          (data) => {
            request.session.level = data;
          })
        );
      }
    );
    done();
  });

  instance.get("/", (request, reply) => {
    if (request.session.level === undefined) {
      reply.send("WINNER");
    } else {
      reply.send("PKL");
    }
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
        "INSERT into logs(username,attempt,correct) VALUES(?,?,?)",
        [
          request.session.user,
          request.body.answer,
          request.body.answer === request.session.level.answer,
        ]
      );
      if (request.body.answer === request.session.level.answer) {
        reply.send({ error: false });
        instance.db.run("UPDATE users SET level=? WHERE id=?", [
          request.session.level.id,
          request.session.user,
        ]);
      } else {
        reply.send({ error: true });
      }
    }
  );
  done();
};

module.exports = gameRoute;
