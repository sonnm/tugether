function secondsToHms(seconds) {
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = `0${date.getUTCSeconds()}`.slice(-2);
  if (hh) {
    return `${hh}:${`0${mm}`.slice(-2)}:${ss}`;
  }
  return `${mm}:${ss}`;
}

const timeHelper = {
  secondsToHms,
};

export default timeHelper;
