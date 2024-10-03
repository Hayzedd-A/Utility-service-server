const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");

const jwtSigner = (email, tokenVersion) =>
  new Promise((res, rej) => {
    jwt.sign(
      { _id: uuid(), email: email, tokenVersion: tokenVersion },
      process.env.JWT_PRIVATE_KEY,
      function (err, token) {
        if (err) rej(err);
        else res(token);
      }
    );
  });

const jwtVerifier = token => {
  return new Promise((res, rej) => {
    jwt.verify(token, process.env.JWT_PRIVATE_KEY, function (err, decoded) {
      if (err) rej(err);
      else res(decoded);
    });
  });
};

module.exports = { jwtSigner, jwtVerifier };
