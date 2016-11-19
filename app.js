angular.module('mohack', ['ngRoute'])
	.config(function ($routeProvider) {
		$routeProvider.when('/', {templateUrl: 'locations.html', controller: 'LocationsController'});
		$routeProvider.when('/location/IM-HERE/:id', {templateUrl: 'select.html', controller: 'LocationsSelectController'});

	})
	.controller('LocationsController',function($scope, ApiService, $location) {
		
		/*
		*	Scope property to hold quotes.
		*/
		$scope.locations = [];
		$scope.form = {};
		$scope.error = false;

		$scope.selectLocation = function(id) {
			console.log(id)
			$location.url('/location/IM-HERE/' + id);
		}
		function getLocations() {
			$scope.locations = ApiService.getLocations();
		}

		getLocations();
	})
	.controller('LocationsSelectController', function($scope, ApiService){
		
	})
	.service('ApiService', function($http, $q) {

		/*
		*	Function which generates the omdb api url
		*/
		var QUOTE_API_ROOT = 'http://movie-quotes-2.herokuapp.com/api/v1/quotes';

		this.getLocations = function() {
			return [{
					 id: 1,
					 online: true,
					 location: "Cafe Nero, Belfast",

					},
					{
					 id: 2,
					 online: true,
					 location: "Starbucks, Belfast",

					},
					{
					 id: 3,
					 online: true,
					 location: "Costa, Belfast",

					},


					];
		}
		/*
		*	Function which generates the omdb api url
		*/
		

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
