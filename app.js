const fastify = require("fastify")({ logger: false });
const path = require("path");
const config = require("./config");
const crypto = require("crypto");
require("dotenv").config();

/* plugins */
fastify.register(require("@fastify/view"), {
  engine: {
    ejs: require("ejs"),
  },
});
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
});
fastify.register(require("@fastify/cookie"));
fastify.register(require("@fastify/session"), {
  cookieName: "sessionId",
  secret:
    process.env.NODE_ENV === "production"
      ? crypto.randomBytes(16).toString("hex")
      : "0".repeat(32),
  cookie: { secure: process.env.NODE_ENV === "production" },
  expires: 1800000,
});

fastify.register(require("./plugins/db"));

/* services */
fastify.register(require("./routes/index"), { prefix: "/" });
fastify.register(require("./routes/admin"), { prefix: "/admin" });
fastify.register(require("./routes/auth"), { prefix: "/auth/" });
fastify.register(require("./routes/game"), { prefix: "/play" });
fastify.register(require("./routes/levels"), { prefix: "/" });

fastify.setNotFoundHandler((request, reply) => {
  reply.send("not found");
});
fastify.setErrorHandler((err, request, reply) => {
  console.log(err);
  reply.send({
    error: true,
  });
  // TODO: log error
});

fastify.listen({ port: config.port }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  } else {
    console.log(`Listening on http://localhost:${config.port}`);
  }
});
