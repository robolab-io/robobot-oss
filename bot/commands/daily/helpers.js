function roundUpToNearestThirty(timestamp) {
  var date = new Date(timestamp);
  date.setMilliseconds(0);
  date.setSeconds(0);
  var minutes = date.getMinutes();
  var remainder = minutes % 30;
  if (remainder !== 0) {
    date.setMinutes(minutes + (30 - remainder));
  } else {
    // If remainder is 0, check if the minutes are already on a half hour
    // eslint-disable-next-line no-lonely-if
    if (minutes !== 0) {
      date.setMinutes(minutes + 30);
    }
  }
  return date.getTime();
}

function weightedRandom(min, max) {
  return Math.round(max / (Math.random() * max + min));
}

module.exports = {
  roundUpToNearestThirty,
  weightedRandom
}