const bcrypt = require("bcryptjs");
// generate otp link
const generateOTPLink = () => {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const salt = bcrypt.genSaltSync(10);
  const cypher = bcrypt.hashSync(otp, salt);
  return cypher.substring(7).replaceAll(".", "-").replaceAll("/", "-");
  // Implement your custom logic here
  console.log(`OTP link sent to ${email}`);
};

console.log(generateOTPLink());

const expiryDate = new Date();
expiryDate.setMinutes(expiryDate.getMinutes() + 5);
console.log(new Date());
console.log(expiryDate);
console.log(new Date() < expiryDate);
