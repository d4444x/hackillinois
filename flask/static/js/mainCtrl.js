function MainCtrl($scope, $http) {

  // Getting questions functionality

  function getQuestion(sectionName, level, number, callback) {
       $http.get('/ask'+"/"+sectionName+"/"+level+"/"+number).
      success(function(data, status, headers, config) {
        callback(null, data);
      }).
      error(function(data, status, headers, config) {
        callback(status, data);
      });
  }

  function getQuestions(sectionName, level, callback) {
    $http.get('/ask'+"/"+sectionName+"/"+level).
      success(function(data, status, headers, config) {
        callback(null, data);
      }).
      error(function(data, status, headers, config) {
        callback(status, data);
      });
  }

  function getLevels(sectionName, callback) {
    $http.get('/ask'+"/"+sectionName).
      success(function(data, status, headers, config) {
        callback(null, data);
      }).
      error(function(data, status, headers, config) {
        callback(status, data);
      });
  }

  function getSections(callback) {
    $http.get('/ask').
      success(function(data, status, headers, config) {
        callback(null, data);
      }).
      error(function(data, status, headers, config) {
        callback(status, data);
      });
  }

  function submitAnswer(sectionName, level, number, data, callback) {
    $http.post('/answer'+"/"+sectionName+"/"+level+"/"+number, data).
      success(function(data, status, headers, config) {
        callback(null, data);
      }).
      error(function(data, status, headers, config) {
        callback(status, data);
      });
  }

  function getAnsweredQuestions(callback) {

  }
}

