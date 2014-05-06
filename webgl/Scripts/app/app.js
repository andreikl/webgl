var appRoot = angular.module('mainApp', ['ngRoute']);     //Define the main module

var routeProvider;

appRoot.config(['$routeProvider', function ($routeProvider) {
    routeProvider = $routeProvider;
    $routeProvider
        .when('/example1', {})
        .when('/example2', {})
        .when('/example3', {})
        .otherwise({ redirectTo: '/example1' });
}]);

appRoot.controller('rootController', ['$scope', 'basePath', function ($scope, basePath) {
    routeProvider.when('/example1', { templateUrl: basePath + 'Content/partials/example1.html', controller: 'Example1Controller' });
    routeProvider.when('/example2', { templateUrl: basePath + 'Content/partials/example2.html', controller: 'Example2Controller' });
    routeProvider.when('/example3', { templateUrl: basePath + 'Content/partials/example3.html', controller: 'Example3Controller' });
    routeProvider.when('/example4', { templateUrl: basePath + 'Content/partials/example4.html', controller: 'Example4Controller' });
    $scope.basePath = basePath;
}]);
