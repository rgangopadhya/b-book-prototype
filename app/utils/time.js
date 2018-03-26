const durationToTime = (durationMillis) => {
  if (!durationMillis) {
    return null;
  }
  const minutes = parseInt(durationMillis/ (1000 * 60));
  const seconds = parseInt((durationMillis - minutes * 60 * 1000) / 1000);
  return `${minutes}:${addLeadingZero(seconds)}`;
}

export default durationToTime;

const addLeadingZero = (seconds) => {
  if (seconds / 10 > 1) {
    return seconds;
  }
  return `0${seconds}`;
}

