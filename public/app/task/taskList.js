angular.module('vtms').directive('taskList', function() {
  return {
    templateUrl: '/partials/task/task-list',
    restrict: 'E',
    scope: {
      lesson: '=',
      tasks: '=',
      config: '='
    },
    controller: function($scope, $rootScope, vtmsTask, vtmsActivity, vtmsLesson, vtmsNotifier) {

      /**
       * Data Initialiazation
       */
      
      // Ensure that $scope.tasks is populated even if just the task was passed in
      if($scope.tasks) {
        // Just use those tasks
        $scope.taskList = $scope.tasks;
      } else {
        // We must be passing in the lesson, so get those tasks
        $scope.taskList = vtmsTask.getList({id: $scope.lesson.id});
      }
      
      // Grab any additional data that certain functionality requires
      
      // TODO: Figure out how to offload this into a config option
      $scope.sortOption = 'dueDate()';
      
      /**
       * Private Functions
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
      
      var checkLessonCompletionStatus = function(task) {
        // Get all tasks from that lesson and update benchmarks
        vtmsTask.getList({id: task.fkLesson}, function(tasks) {
          vtmsLesson.get({id: task.fkLesson}, function(lesson) {
            lesson.updateBenchmarks(tasks);
          });
        });
      };
      
      
      
      
      /**
       * Public Functions
       */
      
      $scope.activateTask = function(activatedTask) {
        activatedTask.activate().then(function(newData) {
          angular.extend(activatedTask, newData);
          var newActivity = new vtmsActivity();
          newActivity.createActivityForTask(activatedTask).then(function(createdActivity) {
            $rootScope.$broadcast('task:activated', activatedTask, createdActivity);
          });
        });
      };
      
      $scope.deactivateTask = function(deactivatedTask) {
        deactivatedTask.deactivate().then(function(newData) {
          angular.extend(deactivatedTask, newData);
          $rootScope.$broadcast('task:deactivated', deactivatedTask);
        });
      };
      
      $scope.completeTask = function(completedTask) {
        completedTask.complete().then(function(newData) {
          angular.extend(completedTask, newData);
          checkLessonCompletionStatus(completedTask);
          $rootScope.$broadcast('task:completed', completedTask);
        });
      };
      
      $scope.incompleteTask = function(incompletedTask) {
        incompletedTask.incomplete().then(function(newData) {
          angular.extend(incompletedTask, newData);
          $rootScope.$broadcast('task:incompleted', incompletedTask);
        });
      };

      
      /**
       * Listeners
       */
            
      $rootScope.$on('task:activated', function(event, task) {
        if($scope.config.type === 'actionable') {
          removeFromList(task, $scope.taskList);
        }
        if($scope.config.type === 'active') {
          addToList(task, $scope.taskList);
        }
      });
            
      $rootScope.$on('task:deactivated', function(event, task) {
        if($scope.config.type === 'active') {
          removeFromList(task, $scope.taskList);
        }
        if($scope.config.type === 'actionable') { 
          addToList(task, $scope.taskList);
        }
      });
      
      $rootScope.$on('task:completed', function(event, task) {
        console.log('task:completed');
        console.log(task);
        if($scope.config.type === 'actionable') {
          removeFromList(task, $scope.taskList);
        }
        if($scope.config.type === 'active') {
          removeFromList(task, $scope.taskList);
        }
      });
    }
  };
});