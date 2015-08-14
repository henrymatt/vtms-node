angular.module('vtms').directive('activityList', function() {
  return {
    templateUrl: '/partials/activity/activity-list',
    restrict: 'E',
    scope: {
      config: '=',
      userId: '='
    },
    controller: function($scope, $rootScope, vtmsActivity, vtmsLesson, vtmsTask, vtmsNotifier) {
      
      $scope.refresh = function() {
        $scope.activityList = $scope.config.update();
      };
      
      $scope.refresh();
      
      
      /**
       * Sorting
       */
      $scope.sortOptions = [];
      
      if($scope.config.sortOptions) {
        // Interpret config sort options
        $scope.sortOptions.push({value: "timeStart", text: "Sort by Start Time - Ascending"});
        $scope.sortOptions.push({value: "-timeStart", text: "Sort by Start Time - Descending"});
        if($scope.config.sortOptions.lesson) {
          $scope.sortOptions.push({
            value: ['lesson.languageSery.language.name', 'lesson.languageSery.title', 'lesson.number'], 
            text: "Sort by Language"
          });
        }
        $scope.selectedSortOption = $scope.sortOptions[0].value;
      } else {
        // Default sort values
        $scope.selectedSortOption = '-timeStart';
      }
      
      
      /**
       * Private functions
       */
      
      var findIdOnList = function(id, list) {
        for(var i = 0; i < list.length; i++) {
          if(id === list[i].id) {
            return i;
          }
        }
        return -1;
      };
      
      var removeFromList = function(item, list) {
        var indexToDelete = findIdOnList(item.id, list);
        if(indexToDelete > -1) {
          list.splice(indexToDelete, 1);
          console.log(list.length);
          return true;
        } else {
          return false;
        }
      };

      var addToList = function(item, list) {
        if(findIdOnList(item.id, list) > -1) {
          return false;
        } else {
          list.push(item);
          console.log(list.length);
          return true;
        }
      };
      
      var extendItemOnList = function(item, list, object) {
        var indexFound = findIdOnList(item.id, list);
        if(indexFound > -1) {
          angular.extend(list[indexFound], object); 
          return true;
        } else {
          return false;
        }
      };
      
      var setAsMostRecentTask = function(task) {
        console.log("setAsMostRecentTask called");
        vtmsLesson.get({id: task.fkLesson}, function(lesson) {
          console.log(lesson);
          lesson.update({fkLastTask: task.id, lastTaskTime: moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')}).then(function(lesson) {
          });
        });
      };
      
      var checkLessonCompletionStatus = function(task) {
        // Get all tasks from that lesson and update benchmarks
        vtmsTask.getList({id: task.fkLesson}, function(tasks) {
          vtmsLesson.get({id: task.fkLesson}, function(lesson) {
            lesson.updateBenchmarks(tasks);
          });
        });
      };
      
      function deleteFromList(item, list) {
        var index = list.indexOf(item);
        var itemToDelete = list[index];
        itemToDelete.delete().then(function() {
          list.splice(index, 1);
        });
      }
      
      var deactivateActiveActivitiesOnList = function() {
        for(var i = 0; i < $scope.activityList.length; i++) {
          if(!$scope.activityList[i].isCompleted) {
            $scope.deactivateActivity($scope.activityList[i]);
          }
        }
      };
      
      
      /**
       * Public functions
       */
      
      $scope.newActivityValues = {
        activity: '',
        fkTeamMember: $scope.userId,
        timeStart: ''
      };
      
      $scope.createActivity = function() {
        deactivateActiveActivitiesOnList();
        
        if($scope.newActivityValues.activity.length > 0) {
          var now = moment(Date.now());
          $scope.newActivityValues.timeStart = now.format('YYYY-MM-DD HH:mm:ss');
          $scope.newActivityValues.isActive = true;
          var newActivity = new vtmsActivity($scope.newActivityValues);
          newActivity.$save().then(function(activity) {
            $scope.activityList.push(activity);
            vtmsNotifier.notify('Began new activity: ' + $scope.newActivityValues.activity);
            $scope.newActivityValues.activity = '';
          });
        }
      };
      
      $scope.deleteActivity = function(activity) {
        deleteFromList(activity, $scope.activityList);
        vtmsNotifier.notify('Deleted an activity.');
      };

      $scope.completeActivity = function(activity) {
        activity.complete().then(function(newData) {
          if(activity.fkTask) {
            // It's either a Task or an Issue activity
            if(activity.activity === 'Fixing issues') {
              
            } else {
              vtmsTask.get({id: activity.fkTask}, function(task) {
                task.complete().then(function() {
                  if(!task.taskGlobal.isAsset) setAsMostRecentTask(task);
                  checkLessonCompletionStatus(task);
                  $rootScope.$broadcast('task:completed', task);
                  $scope.refresh();
                });
              });
            }
          } else {
            $scope.refresh();
          }
          angular.extend(activity, newData);
        });
      };
      
      $scope.deactivateActivity = function(activity) {
        activity.deactivate().then(function(newData) {
          if(activity.fkTask) {
            // It's either a Task or an Issue activity
            if(activity.activity === 'Fixing issues') {
              
            } else {
              vtmsTask.get({id: activity.fkTask}, function(task) {
                task.deactivate().then(function() {
                  $scope.refresh();
                  $rootScope.$broadcast('task:deactivated', task);
                });
              });
            }
          } else {
            $scope.refresh();
          }
          angular.extend(activity, newData);
        });
      };
      
      
      /**
       * Listeners
       */
      
      $rootScope.$on('task:activated', function(event, task, activity) {
        $scope.refresh();
      });
      
      $rootScope.$on('activity:deactivated', function(event, activity) {
        $scope.refresh();
      });
      
      $rootScope.$on('activity:toBeAdded', function(event, activity) {
        // I don't like this, but we need a way to turn off activities when
        // created out of this scope
        deactivateActiveActivitiesOnList();
      });
      
      $rootScope.$on('activity:created', function(event, activity) {
        $scope.refresh();
      });
                     
    }
  };
});