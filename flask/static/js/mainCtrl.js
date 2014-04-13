 angular.module('tutsApp', ['ngSanitize'])
  .controller('MainCtrl', function ($scope, $http) {

    ///////////////////////////////
    // Controller Wide Variables //
    ///////////////////////////////
    $scope.sections = [];                                 // The list sections (topics) that are available
    $scope.levels = {};                                   // Holds the current levels of difficulty for all question types that have been loaded
    $scope.questions = {};                                // Holds all loaded questions
    $scope.currentQuestion = 'Question not selected.';    // The text currently displayed in the question text box
    $scope.currentTitle = 'Select a Question';            // Title text for the question box
    $scope.currentQuestionId = '';                        // ID (path) of the current question that the user is answering
    $scope.answeredQuestions = [];                        // List of all questions that a user has answered
    $scope.openSections = [];                             // List of the sections that the user has paid for
    $scope.currentBalance = 0.0;                          // Local copy of the current balance
    $scope.stats = {};                                    // Stats page storage variable


    /////////////////////////////////////
    // Getting questions functionality //
    /////////////////////////////////////

    // Get a question given its section, difficulty level, number in the series and a callback
    // Callback params are err, and res. 
    // err is non-null if an error occured, and res contains the return data
    $scope.getQuestion = function(sectionName, level, number, callback) {
         $http.get('/ask'+"/"+sectionName+"/"+level+"/"+number).
        success(function(data, status, headers, config) {
          callback(null, data);
        }).
        error(function(data, status, headers, config) {
          callback(status, data);
        });
    }

    // Gets all questions listed under a given section and difficulty level
    $scope.getQuestions = function(sectionName, level, callback) {
      $http.get('/ask'+"/"+sectionName+"/"+level).
        success(function(data, status, headers, config) {
          callback(null, data);
        }).
        error(function(data, status, headers, config) {
          callback(status, data);
        });
    }

    // Gets the available levels of problems in a given section
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
      $http.post('/answer'+"/"+sectionName+"/"+level+"/P"+number, data).
        success(function(data, status, headers, config) {
          callback(null, data);
        }).
        error(function(data, status, headers, config) {
          callback(status, data);
        });
    }

    $scope.getAnsweredQuestions = function(callback) {
      $http.get('/answered').
        success(function(data, status, headers, config) {
          callback(null, data);
        }).
        error(function(data, status, headers, config) {
          callback(status, data);
        });
    }

    $scope.getBalance = function(callback) {
      $http.get('/credit/').
        success(function(data, status, headers, config) {
          callback(null, data);
        }).
        error(function(data, status, headers, config) {
          callback(status, data);
        });
    }

    $scope.getStats = function(callback) {
      $http.get('/getGraph/').
        success(function(data, status, headers, config) {
          callback(null, data);
        }).
        error(function(data, status, headers, config) {
          callback(status, data);
        });
    }

    $scope.getOpenSections = function(callback) {
      $http.get('/getOpenSections/').
        success(function(data, status, headers, config) {
          callback(null, data);
        }).
        error(function(data, status, headers, config) {
          callback(status, data);
        });
    }
    // End Get questions functionality

    $scope.getThoseStats = function() {
      $scope.getStats(function(err, data) {
        if (err) {
          console.log("oh no" + err);
          return;
        }
        $scope.stats = data;
      })
    }

    $scope.filterOpenSections = function () {
      return $scope.letters.filter(function (letter) {
        return $scope.filterBy.indexOf(letter.id) !== -1;
      });
    };

    var showAnswerResult = function(correct) {
      angular.element('#answer-status').css(correct?{ "color": "green" }:{ "color": "red"})
      var newClass = correct?'glyphicon-ok-sign':'glyphicon-remove-sign';

      angular.element('#answer-status').addClass(newClass)
      angular.element('#answer-status').fadeIn(600, function() {
        angular.element('#answer-status').fadeOut(500, function() {
          angular.element('#answer-status').removeClass(newClass);
        });
      });
    }

    $scope.updateBalance = function() {
      $scope.getBalance(function(err, data) {
        if (err) {
          console.log("oh no" + err);
          return;
        }
        $scope.currentBalance = data.credit;
      })
    }

    $scope.submitAnswer = function() {
      angular.element("#loading-img").show();
      $http.post('/answer/', {'qid':$scope.currentQuestionId, 'answer':$scope.currentAnswer.toLowerCase()}).
        success(function(data, status, headers, config) {
          angular.element("#loading-img").hide();

          var correct = data.correct === 'true';
          showAnswerResult(correct);
          if (correct) {
            $scope.updateBalance();
            $scope.answeredQuestions.push($scope.currentQuestionId);
          }
        }).
        error(function(data, status, headers, config) {
          console.log('oh no' + status);
        });
    }

    $scope.selectQuestion = function(section, level, question) {
      $scope.getQuestion(section, level, 'P' + question, function(err, res) {
        if (err) {
          console.log("oh no" + err);
          return;
        }
        $scope.currentQuestion = res.question;
        $scope.currentTitle = res.title;
        $scope.currentQuestionId = '/questions/sections/'+section+'/level/'+level+'/P'+question;
      })      
    }

    $scope.expandSection = function(section) {
      $scope.getLevels(section, function(err,res) {
        if (err) {
          console.log("oh no" + err);
          return;
        }
        var currentSection = Object.keys(res)[0];

        var mapz = {'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5};
        var tmp = [];
        angular.forEach(res[Object.keys(res)[0]], function(value, key){

          tmp.push({ name: value, sort: mapz[value]});
        });
        if (!!!$scope.levels[Object.keys(res)[0]]) {
        } else {
          return;
        }
        $scope.levels[Object.keys(res)[0]] = tmp;
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
        // console.log($scope.questions[currentSection][currentLevel]);
      });
    }

    $scope.hasAnswered = function (section, level, question) {
      return $scope.answeredQuestions.indexOf('/questions/sections/'+section+'/level/'+level+'/P'+question) > -1;
    }

    $scope.$on('sectionEnumerated', function(ngRepeatFinishedEvent) {
      // Group all .trees
      $('.tree > ul').attr('role', 'tree').find('ul').attr('role', 'group');

      //
      $('.tree').find('li:has(ul)').not('.parent_li').addClass('parent_li').attr('role', 'treeitem').find(' > span').on('click', function (e) {
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

    $scope.getAnsweredQuestions(function(err, res) {
      if (err) {
        console.log("oh no" + err);
        return;
      }
      $scope.answeredQuestions = res.split(" ");
    });

    // Init the sections  
    $scope.getSections(function(err, res) {
      if (err) {
        console.log("oh no" + err);
        return;
      }
      $scope.sections = res.sections;
      $scope.expandSection($scope.sections[1]);
    });

    $scope.getOpenSections(function(err, res) {
      if (err) {
        console.log("oh no" + err);
        return;
      }
      $scope.openSections = res.sections.split(" ");
      console.log($scope.openSections);
    });

    $scope.updateBalance();

    //
    // Utility/Internal functions
    //
    $scope.capitalizeEachWord = function(str) {
      return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    }
  })
  .filter('inArray', function($filter){
    return function(list, arrayFilter){
      if(arrayFilter){
        return $filter("filter")(list, function(listItem){
          return arrayFilter.indexOf(listItem) != -1;
        });
      }
    };
  })
  .filter('reverse', function() {
    return function(items) {
      if (!!!items) {
        return;
      }
      return items.slice().reverse();
    };
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
  .directive('problemText',function() {
    return {
      restrict : 'A',
      link : function(scope, element, attr) {
        if (!!!scope.currentQuestion.question) {
          return;
        }
        var tag = scope.currentQuestion.question;
        angular.element(element[0]).html('<b>Click</b>');
      }
    };
  })

