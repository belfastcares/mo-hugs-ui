angular.module('mohack', ['ngRoute'])
	.config(function ($routeProvider) {
		$routeProvider.when('/', {templateUrl: 'locations.html', controller: 'LocationsController'});
		$routeProvider.when('/location/IM-HERE/:id', {templateUrl: 'select.html', controller: 'LocationsSelectController'});
		$routeProvider.when('/posts/:id', {templateUrl: 'posts.html', controller: 'PostsController'});

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
			ApiService.service()
			$location.url('/posts/' + $routeParams.id);
		}
	})
	.controller('PostsController', function($scope, ApiService, $routeParams) {
			
			var id = $routeParams.id;
			$scope.test = "test";

			function getPosts(id) {

			}
	})
	.service('ApiService', function($http, $q) {
		this.username = '';
		/*
		*	Function which generates the omdb api url
		*/
		var QUOTE_API_ROOT = 'http://mohack.herokuapp.com';

		this.getLocations = function() {
			return $http.get(QUOTE_API_ROOT + '/GetLocations')
		}
		/*
		*	Function which generates the omdb api url
		*/
		
		this.setUserName = function() {
			this.username = 'USER-' + Math.floor(Math.random()*20+1);
		}
		/*
		* 	Function which gets all of the quotes from the movie quotes api,
		*	and uses the film property of each json object to query the omdb
	    *	database to retrieve more detailed information about the film
	   	* 	this data is then appended to each quote object.	
		*/
	   	this.getAllQuotes = function() {
	      	var promises = [];
	      	var deferredCombinedItems = $q.defer();
	    	var combinedItems = [];
	    	var url = null;
	    	return $http.get(QUOTE_API_ROOT)
	    		.then(function(res) {
		     		angular.forEach(res.data, function(quote) {
		       			var deferredItemList = $q.defer();
		       			url = generateURL(quote.film);
		       			$http.get(url).then(function(res) {
		         			quote.imdb = res.data;
		            			combinedItems = combinedItems.concat(quote);
		            			deferredItemList.resolve();
		         		});         
		         		promises.push(deferredItemList.promise);
		        	});
		        	$q.all(promises).then(function() {
		          		deferredCombinedItems.resolve(combinedItems);
		        	});
		       		return deferredCombinedItems.promise;
	      		});
	    }

		/*
		*	This function has the same funcionality as getAllQuotes
		*	only one quoute is returned by querying by ID
		*/   
	    this.gt = function(id) {
	   		var url = QUOTE_API_ROOT + '/' + id;
	   		return $http.get(url)
	   			.then(function(res) {
		   			url = generateURL(res.data.film);
		   			return $http.get(url).then(function(response) {
		   				var quote = res.data;
		   				quote.imdb = response.data;
		   				return quote;
		   			});
	   			});
	    }

		/*
		*	This function has the same funcionality as getAllQuotes
		*	only one one random quote is returned.
		*/   
	    this.getRandomQuote = function(id) {
	   		var url = QUOTE_API_ROOT + '/random';
	   		return $http.get(url)
	   			.then(function(res) {
		   			url = generateURL(res.data.film);
		   			return $http.get(url).then(function(response) {
		   				var quote = res.data;
		   				quote.imdb = response.data;
		   				return quote;
		   			});
	   			});
	    }

	});
