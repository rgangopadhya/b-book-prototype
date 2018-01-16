export function maskPassword(password) {
  if (!password) {
    return null;
  }
  return [...Array(password.length).keys()].map(_ => '*').join('');
}
