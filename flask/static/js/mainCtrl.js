'use strict';

angular.module('tutsApp')
  ////////////////
  // Controller //
  ////////////////
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
    // End Get questions functionality

    $scope.expandSection = function(section) {
      $scope.getLevels(section, function(err,res) {
        if (err) {
          console.log("oh no" + err);
          return;
        }
        var currentSection = Object.keys(res)[0];
        $scope.levels[Object.keys(res)[0]] = res[Object.keys(res)[0]];
      });
    }

    $scope.expandLevel = function(section, level) {
      $scope.getQuestions(section, level, function(err,res) {
        if (err) {
          console.log("oh no" + err);
          return;
        }
        var currentSection = Object.keys(res)[0];
        var currentLevel = Object.keys(res[currentSection])[0];

        if (!!!$scope.questions[currentSection]) {
          $scope.questions[currentSection] = {};
        }
        $scope.questions[currentSection][currentLevel] = [];

        for (var i = res[currentSection][currentLevel].length - 1; i >= 0; i--) {
          $scope.questions[currentSection][currentLevel][i] = res[currentSection][currentLevel][i].substring(1);
        };
      });
    }

    // TODO: Need to rewrite this
    $scope.$on('sectionEnumerated', function(ngRepeatFinishedEvent) {
      // console.log(ngRepeatFinishedEvent);
      $('.tree > ul').attr('role', 'tree').find('ul').attr('role', 'group');
      $('.tree').find('li:has(ul)').addClass('parent_li').attr('role', 'treeitem').find(' > span').on('click', function (e) {
        var children = $(this).parent('li.parent_li').find(' > ul > li');
        if (children.is(':visible')) {
          children.hide('fast');
          $(this).addClass('glyphicon-plus-sign').removeClass('glyphicon-minus-sign');
        }
        else {
          children.show('fast');
          $(this).addClass('glyphicon-minus-sign').removeClass('glyphicon-plus-sign');
        }
        e.stopPropagation();
      });
    });

    // Init the sections  
    $scope.getSections(function(err,res) {
      if (err) {
        console.log("oh no" + err);
        return;
      }
      $scope.sections = res.sections;
    });

    //
    // Utility/Internal functions
    //
    function capitalizeEachWord(str) {
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }
  })
  ////////////////
  // Directives //
  ////////////////
  .directive('onFinishRenderSection',function($timeout) {
    return {
      restrict : 'A',
      link : function(scope, element, attr) {
        if (scope.$last === true) {
          $timeout(function () {
            scope.$emit('sectionEnumerated');
          });
        }
      }
    };
  })
  .directive('onFinishRenderLevel',function($timeout) {
    return {
      restrict : 'A',
      link : function(scope, element, attr) {
        if (scope.$last === true) {
          $timeout(function () {
            scope.$emit('sectionEnumerated');
          });
        }
      }
    };
  })
  .directive('onFinishRenderQuestions',function($timeout) {
    return {
      restrict : 'A',
      link : function(scope, element, attr) {
        if (scope.$last === true) {
          $timeout(function () {
            scope.$emit('sectionEnumerated');
          });
        }
      }
    };
  })

