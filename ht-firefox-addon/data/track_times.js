var tableData = document.getElementsByTagName('td');
self.port.on('check_times', function() {
  // TODO: force dashboard page open
  var tableData = document.getElementsByTagName('td');
  var chk = 2;
  var interval = 7;
  var notify = [];
  var current = new Date();
  var min = current.getMinutes();
  var hour = current.getHours();
  var staticDate = '01/01/2015'
  var timeStr = staticDate+' '+hour+':'+min;
  var fixed = Date.parse(timeStr);
  for (var i=0;i<tableData.length;i++) {
    if (i===chk) {
      var time = tableData[i].innerHTML.trim();
      var t = Date.parse(staticDate+' '+time);
      if (t===fixed) {
        notify.push(tableData[i-1].innerHTML.trim());
      }
      chk+=interval;
    }
  }
  self.port.emit('time_resp', notify);
});
