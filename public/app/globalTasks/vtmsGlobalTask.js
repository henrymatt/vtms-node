angular.module('vtms').factory('vtmsGlobalTask', function($resource, $q) {
  var TeamMemberResource = $resource('/api/team-members/:id', {id: "@id"}, {
    update: {method:'PUT', isArray: false},
    getListForSeries: {method:'GET', url: '/api/series/:id/global-tasks', isArray:true}
  });

  TeamMemberResource.prototype.update = function(newData) {
    var dfd = $q.defer();

    this.$update(newData).then(function() {
      dfd.resolve();
    }, function(response) {
      dfd.reject(response.data.reason);
    });
    return dfd.promise;
  };

  return TeamMemberResource;
});
