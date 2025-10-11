export const validatePassword = (password: string) => ({
  length: password.length >= 8,
  letter: /[a-zA-Z]/.test(password),
  number: /\d/.test(password),
  special: /[@$!%*?&]/.test(password),
});
