angular.module('app.stats', [])

.controller('StatsController', ['$scope', '$location', 'Habits',
  function($scope, $location, Habits){
    $scope.days = 10 
    $scope.successRate = function(recentDays){
      var length = Math.min($scope.days, recentDays.length - 1)
      var cutoff = recentDays.length - 1 - length; 
      var totalEarned = 0;
      var totalPossible = 0;
      for (var i = recentDays.length - 1; i >= cutoff ; i--) {
        totalEarned += recentDays[i].difficultyPointsEarned;
        totalPossible += recentDays[i].possiblePointsThisDay;
      }
      return Math.floor(totalEarned * 100 / totalPossible);
    };
    $scope.difficultyPoints = function(recentDays){ //90
      var length = Math.min($scope.days, recentDays.length ); //90
      var cutoff = recentDays.length - length; 
      totalPossible = 0; 
      for (var i = recentDays.length - 1; i >= cutoff ; i--) {
        totalPossible += recentDays[i].possiblePointsThisDay;
      }
      return Math.floor(totalPossible / length); 
    };
    $scope.fakeUsers = [{userName: 'bob',  recentStats : [{difficultyPointsEarned: 10,
      possiblePointsThisDay: 13}]}];
    Habits.getStats().then(function(allUsers){
      $scope.allUsers = allUsers; 
      console.log(allUsers);
    });
   }
  ]); 