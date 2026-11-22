export const isValidFullName = (name) => {
  const fullNameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;
  return fullNameRegex.test(name.trim());
};