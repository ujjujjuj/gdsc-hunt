const levelsRoute = (instance, options, done) => {

  instance.get("/gottagofast", (request, reply) => {
    return reply.view("challenges/gottagofast.html");
  });
  done();
};

module.exports = levelsRoute;
