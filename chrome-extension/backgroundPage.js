// recommend changing to lower interval for dev testing,
// especially while naive timecheck
chrome.alarms.create('check_timers', {periodInMinutes:1});

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name==='check_timers') {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load',check_reminders);
    xhr.open('GET','https://habit-trainer.herokuapp.com/api/users/habits');
    xhr.setRequestHeader('Authorization','Bearer '+ht_jwt);
    xhr.send();
  }
});

var ht_jwt;
chrome.runtime.onMessage.addListener(function(req,sender,resp) {
  if (req.creds) {
    ht_jwt = req.creds;
  }
});

function check_reminders(data) {
  var habits = JSON.parse(data.target.response).habits;
  var current = new Date();
  var min = current.getMinutes();
  var hour = current.getHours();
  var staticDate = '01/01/1970'
  var timeStr = staticDate+' '+hour+':'+min;
  var fixed = Date.parse(timeStr);
  for (var i=0;i<habits.length;i++) {
    var time = habits[i].reminderTime.substr(0,19);
    var t = Date.parse(time);
    // TODO: prob should be diff<min
    // maybe add more options?
    if (t===fixed) {
      chrome.notifications.create(habits[i].habitName+'remind', {
        type: 'basic',
        iconUrl: './LetterH.png',
        title: 'Habit-Trainer! - '+habits[i].habitName,
        message: habits[i].habitName
      });
    }
  }
}
