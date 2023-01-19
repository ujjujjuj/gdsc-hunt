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
            teamID: { type: "string", minLength: 3 },
            password: { type: "string", minLength: 6 },
            teamName: { type: "string", minLength: 3 },
          },
          required: ["teamID", "password", "teamName"],
        },
      },
    },
    (request, reply) => {
      instance.db.get(
        "SELECT id from users where id=?",
        [request.body.teamID],
        async (e, res) => {
          if (res === undefined) {
            instance.db.run(
              "INSERT INTO users (id, password, team_name) VALUES (?,?,?)",
              [
                request.body.teamID,
                await hashPassword(request.body.password),
                request.body.teamName,
              ]
            );
            request.session.user = request.body.teamID;
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
            teamID: { type: "string", minLength: 3 },
            password: { type: "string", minLength: 6 },
          },
          required: ["teamID", "password"],
        },
      },
    },
    (request, reply) => {
      instance.db.get(
        "SELECT password from users where id=?",
        [request.body.teamID],
        async (e, res) => {
          if (
            res !== undefined &&
            (await verifyPassword(res.password, request.body.password))
          ) {
            request.session.user = request.body.teamID;
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
