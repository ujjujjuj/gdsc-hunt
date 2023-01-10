const argon2 = require("argon2");

const hashPassword = argon2.hash;
const verifyPassword = argon2.verify;

module.exports = {
  hashPassword,
  verifyPassword,
};
