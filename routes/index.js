const indexRoute = (instance, options, done) => {
  instance.get("/", (request, reply) => {
    reply.view("/views/index.ejs", { username: request.session.user });
  });

  instance.get("/rules", (request, reply) => {
    reply.view("/views/rules.ejs", { username: request.session.user });
  });

  instance.get("/leaderboard", (request, reply) => {
    instance.db.all(
      "SELECT id,level FROM users ORDER BY level DESC, last_answered ASC",
      (err, users) => {
        const leaderboard = users.map((user) => [user.id, user.level]);
        reply.view("/views/leaderboard.ejs", {
          username: request.session.user,
          leaderboard,
        });
        done();
      }
    );
  });

};

module.exports = indexRoute;
