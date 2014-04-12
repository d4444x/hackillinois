angular.module('tutsApp', [])
  .controller('MainCtrl', function ($scope, $http) {
    $scope.sections = [];
    $scope.levels = {};
    $scope.questions = {};

    // Getting questions functionality

    $scope.getQuestion = function(sectionName, level, number, callback) {
         $http.get('/ask'+"/"+sectionName+"/"+level+"/"+number).
        success(function(data, status, headers, config) {
          callback(null, data);
        }).
        error(function(data, status, headers, config) {
          callback(status, data);
        });
    }

    $scope.getQuestions = function(sectionName, level, callback) {
      $http.get('/ask'+"/"+sectionName+"/"+level).
        success(function(data, status, headers, config) {
          callback(null, data);
        }).
        error(function(data, status, headers, config) {
          callback(status, data);
        });
    }

    $scope.getLevels = function(sectionName, callback) {
      $http.get('/ask'+"/"+sectionName).
        success(function(data, status, headers, config) {
          callback(null, data);
        }).
        error(function(data, status, headers, config) {
          callback(status, data);
        });
    }

    $scope.getSections = function(callback) {
      $http.get('/ask').
        success(function(data, status, headers, config) {
          callback(null, data);
        }).
        error(function(data, status, headers, config) {
          callback(status, data);
        });
    }

    $scope.submitAnswer = function(sectionName, level, number, data, callback) {
      $http.post('/answer'+"/"+sectionName+"/"+level+"/"+number, data).
        success(function(data, status, headers, config) {
          callback(null, data);
        }).
        error(function(data, status, headers, config) {
          callback(status, data);
        });
    }

    $scope.getAnsweredQuestions = function(callback) {

    }

    // Init the sections  
    $scope.getSections(function(err,res) {
      if (err) {
        console.log("oh no" + err);
        return;
      }
      $scope.sections = res.sections;
      updateLevels();
    });
    
    function updateLevels() {
      for (var i = $scope.sections.length - 1; i >= 0; i--) {
        $scope.getLevels($scope.sections[i], function(err,res) {
          if (err) {
            console.log("oh no" + err);
            return;
          }
          var currentSection = Object.keys(res)[0];
          $scope.levels[Object.keys(res)[0]] = res[Object.keys(res)[0]];
        })
      };
    }
  })
  .directive('selectEvent',function() {
    return {
      restrict : 'A',
      link : function(scope, element, attr) {
        if (scope.$last === true) {
          var addSelectionFunc = function(event, ui) {
            scope.$apply(function(){
              scope.addToSelected(event, ui);
            });
          };
          var removeSelectionFunc = function(event, ui) {
            scope.$apply(function() {
              scope.removeFromSelected(event, ui);
            })
          };
          angular.element('.selectable' ).selectable({
            selected : addSelectionFunc,
            selecting : addSelectionFunc,
            unselected : removeSelectionFunc,
            unselecting : removeSelectionFunc
          });
        }
      }
    };

