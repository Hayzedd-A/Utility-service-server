const bcrypt = require("bcryptjs");
const { verifyOtp, passwordRecovery } = require("../config/variables");

// Hash the password
const hashPassword = async password => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return [hashedPassword, salt];
  } catch (error) {
    return error;
  }
};

// compare password
const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    return error;
  }
};

// generate otp link
const generateOTPLink = email => {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const salt = bcrypt.genSaltSync(10);
  const otpCypher = bcrypt
    .hashSync(otp, salt)
    .substring(7)
    .replaceAll(".", "-")
    .replaceAll("/", "-");
  // append it to the verify-otp-endpoint link
  const otpLink = `${verifyOtp}?link=${otpCypher}&email=${email}`;

  return [otpLink, otpCypher];
};

// generate password recovery link
const generatePasswordRecoveryLink = () => {
  const random = String(Math.floor(100000 + Math.random() * 900000));
  const salt = bcrypt.genSaltSync(10);
  // convert the otp to cypher and cut out the first 7 char which consist of a '$' sign
  // and then replace '.' and '/' with '-' to generate a valid link.
  const recoveryCypher = bcrypt
    .hashSync(random, salt)
    .substring(7)
    .replaceAll(".", "-")
    .replaceAll("/", "-");
  // append it to the verify-otp-endpoint link
  const recoveryLink = `${passwordRecovery}?link=${recoveryCypher}`;
  return [recoveryLink, recoveryCypher];
};

// verify password recovery link

// verify otp

module.exports = {
  hashPassword,
  generateOTPLink,
  comparePassword,
  generatePasswordRecoveryLink,
};
