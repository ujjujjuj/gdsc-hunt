const adminRoute = (instance, options, done) => {
  instance.addHook("preHandler", (request, reply, done) => {
    // if (request.session.user === undefined) {
    //   return reply.redirect("/auth/login");
    // }
    // instance.db.get(
    //   "SELECT is_admin FROM users where id=?",
    //   [request.session.user],
    //   (err, user) => {
    //     if (!user.is_admin) {
    //       return reply.redirect("/");
    //     }
    //     done();
    //   }
    // );
    done();
  });

  instance.get("/", (request, reply) => {
    instance.db.all("SELECT * from levels", (err, levels) => {
      reply.view("/views/admin.ejs", { levels });
      done();
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

  instance.get("/logs", (request, reply) => {
    instance.db.all("SELECT * from logs", (e, logs) => {
      return reply.view("/views/logs.ejs", { logs });
    });
  });

  done();
};

module.exports = adminRoute;
