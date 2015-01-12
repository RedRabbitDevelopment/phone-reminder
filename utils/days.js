
module.exports = {
  today: function() {
    var now = this.getDate();
    now = now.getTime() - 1000 * 60 * 60 * 4; // Anytime before four in the morning.
    var days = Math.floor(now / 1000 / 60 / 60 / 24);
    return days;
  },
  getDate: function() {
    var now = new Date();
    // Ensure America/Denver timezone
    now.setTime(now.getTime() - (420 - now.getTimezoneOffset()) * 60 * 1000);
    return now;
  },
  time: function() {
    var now = this.getDate();
    return now.getHours() + (now.getMinutes() / 60);
  }
};
