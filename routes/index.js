const indexRoute = (instance, options, done) => {
  instance.get("/", (request, reply) => {
    reply.view("/views/index.ejs", { username: request.session.user });
  });

  instance.get("/rules", (request, reply) => {
    reply.view("/views/rules.ejs", { username: request.session.user });
  });

  instance.get("/leaderboard", (request, reply) => {
    let leaderboard = [
      ["ishndas", "9"],
      ["vikas", "9"],
      ["shambhavi", "7"],
      ["shubham", "7"],
      ["risk101", "6"],
      ["siddharth", "5"],
      ["niggas_in_paris", "5"],
      ["jahnvi", "3"],
      ["seeya", "-1"],
      ["shubham", "7"],
      ["risk101", "6"],
      ["siddharth", "5"],
      ["niggas_in_paris", "5"],
    ]
    reply.view("/views/leaderboard.ejs", { username: request.session.user, leaderboard });
  });

  done();
};

module.exports = indexRoute;
