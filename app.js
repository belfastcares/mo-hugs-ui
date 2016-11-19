angular.module('mohack', ['ngRoute'])
	.config(function ($routeProvider) {
		$routeProvider.when('/', {templateUrl: 'locations.html', controller: 'LocationsController'});
		$routeProvider.when('/location/IM-HERE/:id', {templateUrl: 'select.html', controller: 'LocationsSelectController'});
		$routeProvider.when('/posts/:id', {templateUrl: 'posts.html', controller: 'PostsController'});

	})
	.controller('NavController', function($scope, ApiService, $location, $timeout) {
		$scope.username = '';
		function getUsername(){
			$scope.username = ApiService.getUsername();
		}
		var poll = function() {
	        $timeout(function() {
				getUsername();
	            poll();
	        }, 1000);
		}; 	   
   		poll();
	})
	.controller('LocationsController',function($scope, ApiService, $location, $timeout) {
		/*
		*	Scope property to hold quotes.
		*/
		$scope.locations = [];
		$scope.form = {};
		$scope.error = false;
		$scope.val = 0;

		$scope.selectLocation = function(id) {
				$location.url('/location/IM-HERE/' + id);
		}

		function getLocations() {
			Promise.resolve(ApiService.getLocations())
				.then(function(data){
					console.log(data.data);
					$scope.locations = data.data;
				})
		}

	    var poll = function() {
	        $timeout(function() {
				getLocations();
	            poll();
	        }, 1000);
		};
	    	   
   		poll();

	})
	.controller('LocationsSelectController', function($scope, ApiService, $location, $routeParams){
		$scope.enterLocation = function() {
			ApiService.setUserName();
			ApiService.joinLocation($routeParams.id)
				.then(function(data) {
					console.log(data);
				})
			$location.url('/posts/' + $routeParams.id);

		}
	})
	.controller('PostsController', function($scope, ApiService, $routeParams, $timeout) {
			
		var id = $routeParams.id;
		$scope.test = "test";

		$scope.message = '';

		$scope.posts = [];

		function getPosts(id) {
			Promise.resolve(ApiService.getPosts(id))
				.then(function(data){
					console.log(data.data);
					$scope.posts = data.data;
				})
		}

	    var poll = function() {
	        $timeout(function() {
			getPosts(id);
	           	poll();
	        }, 1000);
		};

		$scope.postMessage = function(message) {
			var username = ApiService.username;
			ApiService.postMessage(id, username, message);
		}

		poll();

	})
	.service('ApiService', function($http, $q) {
		this.username = '';

		var QUOTE_API_ROOT = 'http://mohack.herokuapp.com';

		this.getLocations = function() {
			return $http.get(QUOTE_API_ROOT + '/GetLocations');
		}

		this.getPosts = function(id) {
			return $http.get(QUOTE_API_ROOT + '/Posts/' + id);
		}

		this.getUsername = function() {
			return this.username;
		}

		this.setUserName = function() {
			this.username = 'USER-' + Math.floor(Math.random()*20+1);
		}

		this.joinLocation = function(id) {
			return $http.get(QUOTE_API_ROOT + '/CheckIn/' + id);
		}

		this.postMessage = function(id, username, message) {
			
			var data = { 'username': username, 'message': message } 
			return $http.post(QUOTE_API_ROOT + '/Posts/' + id, data);
		}
		/*
		* 	Function which gets all of the quotes from the movie quotes api,
		*	and uses the film property of each json object to query the omdb
	    *	database to retrieve more detailed information about the film
	   	* 	this data is then appended to each quote object.	
		*/
	});

