angular.module('app.services', [])

.value('hostUrl', 'http://localhost:8080')

.factory('Habits', ['$http', '$sanitize', '$interpolate', 'notify', 'hostUrl',
  function($http, $sanitize, $interpolate, notify, hostUrl) {

    var _habit = {};
    var service = {};

    service.getHabits = function() {
      return $http({
        method: 'GET',
        url: hostUrl + '/api/users/habits'
      })
      .then(function(resp) {
        return resp.data.habits;
      });
    };

    service.addFakeData = function(username, difficultyPointsEarned, possiblePointsThisDay) {
      return $http({
        method: 'POST',
        url: hostUrl + '/api/users/fakeuserdata',
        data: { 
          username: username, 
          recentStats: [{theDate: new Date(), 
            difficultyPointsEarned: difficultyPointsEarned,
            possiblePointsThisDay: possiblePointsThisDay
        }]}
      })
      .then(function(resp) {
        console.log(resp.data);
      }); 
    };

    service.addHabit = function(habit) {
      habit.habitName = $sanitize(habit.habitName);
      return $http({
        method: 'POST',
        url: hostUrl + '/api/users/habits',
        data: habit
      });
    };

    service.getStats = function(){
      return $http({
        method: 'GET',
        url: hostUrl + '/api/users/allstats',
      })
      .then(function(resp){
        return resp.data; 
      })
    }

    service.setEdit = function(habit) {
      _habit = habit;
      _habit.reminderTime = new Date(_habit.reminderTime);
      _habit.dueTime = new Date(_habit.dueTime);
    };

    service.getEdit = function(habit) {
      return _habit;
    };

    service.updateHabit = function(habit) {
      return $http({
        method: 'PUT',
        url: hostUrl + '/api/users/habits/' + habit._id,
        data: habit
      });
    };

    service.statusChange = function(habitEvent) {
      var exp = $interpolate(habitEvent.message)
      var message = exp({habitName: habitEvent.habit.habitName, eventTime: habitEvent.eventTime});
      // notify(message);
      return $http({
        method: 'PUT',
        url: '/api/users/habits/' + habitEvent.eventName + '/' + habitEvent.habit._id,
        data: habitEvent.habit
      });
    };

    service.checkinHabit = function(habit) {
      notify('Great job completing your habit!');
      return $http({
        method: 'POST',
        url: hostUrl + '/api/records/' + habit._id,
        data: habit
      });
    };

    return service;

  }
])

.factory('Auth', ['$http', '$location', '$window', '$auth', '$sanitize', 'hostUrl', '$state',
  function ($http, $location, $window, $auth, $sanitize, hostUrl, $state) {


    var signin = function (user) {
      console.log(hostUrl);
      user.username = $sanitize(user.username);
      user.password = $sanitize(user.password);
      return $http.post(hostUrl + '/authenticate/signin', user)
        .then(function (resp) {
          return resp.data.token;
        });
    };

    var signup = function (user) {
      user.username = $sanitize(user.username);
      user.password = $sanitize(user.password);
      return $http.post(hostUrl + '/authenticate/signup', user)

        .then(function (resp) {
          return resp.data.token;
        });
    };

    var isAuth = function () {
      return !!$window.localStorage.getItem('habit_token')
    };

    var signout = function () {
      console.log('signing out...');
      $auth.logout()
        .then(function() {
          console.log('in promise');
          //$state.go('signin');
          $location.path(hostUrl + '/signin');
        });
    };

    return {
      signin: signin,
      signup: signup,
      isAuth: isAuth,
      signout: signout
    };
  }
])

.factory('Events', ['Habits',
  function (Habits) {

    // Notification messages
    var eventMessages = {
      reminded: 'Reminder: {{habitName}} is due at {{eventTime | date: "shortTime"}}!',
      failed: 'Habit failed!  You did not complete {{habitName}} by the due time of {{eventTime | date: "shortTime"}}!',
    };

    // event constructor
    var Event = function(habit, eventName, eventTime) {
      this.habit = habit;
      this.eventName = eventName;
      this.eventTime = eventTime;
      this.message = eventMessages[eventName];
    }

    var getEventQueue = function (habits) {
      return habits
        // filter out past-due events and send out notifications
        // for any of which have not been yet notified
        .reduce(function(queue, habit) {
          var failEvent = new Event(habit, 'failed',  habit.dueTime);
          var remindEvent = new Event(habit, 'reminded', habit.reminderTime);
          // if habit dueTime missed
          if (habit.status === 'missed') {
            // display failed notification
            Habits.statusChange(failEvent);
            // keep the current queue
            return queue;
          } else if (habit.status === 'remind') {
            // display reminded notification
            Habits.statusChange(remindEvent);
            // add fail event to the queue
            return queue.concat(remindEvent);
          } else if (habit.status === 'pending') {
            // add remind event and fail event to the queue
            return queue.concat(remindEvent, failEvent);
          }
          return queue;
        }, [])

        // Sort events chronologically by eventTime
        .sort(function (eventA, eventB) {

          return eventA.eventTime - eventB.eventTime;
        });
    };

    // Trigger notifications for all events past their eventTime
    // and remove triggered events from event queue
    var triggerEvents = function (events) {
      if (!events.length) return;
      var date = new Date();
      var timeNow = (date.getHours() * 60) + date.getMinutes();
      var eventDate = new Date(events[0].eventTime);
      var eventTime = (eventDate.getHours() * 60) + eventDate.getMinutes();
      if (timeNow >= eventTime) {
        var event = events.shift()
        Habits.statusChange(event)
          .then(function () {
            triggerEvents(events);
          });
      }
    };

    return {
      getEventQueue: getEventQueue,
      triggerEvents: triggerEvents
    };
  }
]);
