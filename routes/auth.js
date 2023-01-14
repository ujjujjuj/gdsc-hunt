const { hashPassword, verifyPassword } = require("../utils");

const authRoute = (instance, options, done) => {
  instance.get("/register", (request, reply) => {
    if (request.session.user) return reply.redirect("/");
    reply.view("/views/signup.ejs");
  });
  instance.get("/login", (request, reply) => {
    if (request.session.user) return reply.redirect("/");
    reply.view("/views/login.ejs");
  });

  instance.post(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            username: { type: "string", minLength: 4 },
            password: { type: "string", minLength: 6 },
            rollNumber: { type: "string", minLength: 6 },
          },
          required: ["username", "password", "rollNumber"],
        },
      },
    },
    (request, reply) => {
      instance.db.get(
        "SELECT id from users where id=?",
        [request.body.username],
        async (e, res) => {
          if (res === undefined) {
            instance.db.run(
              "INSERT INTO users (id, password, roll_number) VALUES (?,?,?)",
              [
                request.body.username,
                await hashPassword(request.body.password),
                request.body.rollNumber,
              ]
            );
            request.session.user = request.body.username;
            reply.send({ error: false });
          } else {
            reply.send({ error: true });
          }
        }
      );
    }
  );

  instance.post(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          properties: {
            username: { type: "string", minLength: 4 },
            password: { type: "string", minLength: 6 },
          },
          required: ["username", "password"],
        },
      },
    },
    (request, reply) => {
      instance.db.get(
        "SELECT password from users where id=?",
        [request.body.username],
        async (e, res) => {
          if (
            res !== undefined &&
            verifyPassword(res.password, request.body.password)
          ) {
            request.session.user = request.body.username;
            reply.send({ error: false });
          } else {
            reply.send({ error: true });
          }
        }
      );
    }
  );

  instance.get("logout", (request, reply) => {
    if (request.session.user) {
      request.session.destroy();
    }
    return reply.redirect("/auth/login");
  });

  done();
};

module.exports = authRoute;
