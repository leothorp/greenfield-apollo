var self = require('sdk/self');
var { ToggleButton } = require('sdk/ui/button/toggle');
var panels = require('sdk/panel');
var { setInterval } = require('sdk/timers');
var notifications = require('sdk/notifications');

var button = ToggleButton({
  id: 'habit-trainer-toolbar',
  label: 'Habit-Trainer',
  icon: {
    '16':'./icon-16.png',
    '32':'./icon-32.png',
    '64':'./icon-64.png'
  },
  onChange: handleChange
});

// TODO: add offline options & capabilities
var panel = panels.Panel({
  //contentURL: self.data.url('ht-panel.html'),
  contentURL: 'http://habit-trainer.herokuapp.com',
  contentScriptFile: self.data.url('track_times.js'),
  onHide: handleHide,
  height: 400,
  width: 400
});

function handleChange(state) {
  if (state.checked) {
    panel.show({
      position: button
    });
  }
}

function handleHide() {
  button.state('window', {checked: false});
}

var intervalId = setInterval(function() {
  panel.port.emit('check_times', '');
},10000);

panel.port.on('time_resp', function(notify_strings) {
  // TODO: fix multiples @ same time,
  //       add optional audio,
  //       display one notification per (though the regular popups aren't bad)
  notify_strings.forEach(function(text) {
    // can add sound by embedding audio in page w/ contentscript
    notifications.notify({
      title: 'Habit Time! - '+text,
      text: text,
      iconURL: self.data.url('icon-64.png'),
      data: text,
      onClick: confirm_notification
    });
  });
});

var confirm_notification = function(habit) {
  // placeholder - maybe mark completed? depends on UI desire
};
