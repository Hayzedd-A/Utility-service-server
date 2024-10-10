const remoteFrontendUrl = "https://utility-service-frontend.vercel.app/";
const localFrontendUrl = "http://127.0.0.1:3000";
const endpoints = {
  verifyOtp: `${remoteFrontendUrl}verify-email-status`,
  passwordRecovery: `${remoteFrontendUrl}password-recovery`,
};
// const endpoints = {
//   verifyOtp: `{localFrontendUrl}verify-email-status`,
//   passwordRecovery: `{localFrontendUrl}password-recovery`,
// };
module.exports = {
  ...endpoints,
};
