function MainCtrl($scope, $http) {

  // Getting questions functionality
  function getQuestion(sectionName, level, number, callback) {
    
  }

  function getQuestions(sectionName, level, callback) {

  }

  function getLevels(sectionName, callback) {

  }

  function getSections(callback) {
    $http({method: 'GET', url: '/ask'}).
      success(function(data, status, headers, config) {
        callback(null, data);
        // this callback will be called asynchronously
        // when the response is available
      }).
      error(function(data, status, headers, config) {
        callback(status, data);
        // called asynchronously if an error occurs
        // or server returns response with an error status.
      });
  }

  function submitAnswer(sectionName, level, number, callback) {

  }

  function getAnsweredQuestions() {

  }
}

