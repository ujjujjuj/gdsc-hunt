const indexRoute = (instance, options, done) => {
  instance.get("/", (request, reply) => {
    reply.view("/views/index.ejs",{username:"ujjujjuj"});
  });

  instance.get("/leaderboard", (request, reply) => {
    reply.send("leaderboard");
  });

  done();
};

module.exports = indexRoute;
