function OP (bg) {

	let self = this;
	
	this.bg = bg;

	this.app = angular.module('optionsPageApp', ['tabtapPartials', 'ui.router']);
	
	this.app.controller('optionsController', function ($scope, $timeout, $state, $stateParams) {
		
		$scope.page = self;
		
	});
	
	this.app.config(
		
		$stateProvider => {
			
			$stateProvider.state('opt-site', {

				views: {

					'proxy-settings': {
						
						templateUrl: 'proxy-settings.html',
						controller: function ($scope, $compile) {
							
							$scope.proxy_active = true;
							$scope.proxys = Object.keys(self.bg.option_mgr.proxys)
								.map(
									jsl_proxy => {
										
										return {
											
											name: jsl_proxy,
											host: self.bg.option_mgr.proxys[jsl_proxy].host,
											port: self.bg.option_mgr.proxys[jsl_proxy].port,
											type: self.bg.option_mgr.proxys[jsl_proxy].type
										}
									}
								);

							$scope.proxyChange = function (proxy) {
								
								console.log("Proxy changing: ");
								console.log(proxy);
								
							}
							
							$scope.addProxy = function () {

								$scope.proxys.push({ name:"", host: "", port: "", type: "" });
								
							}

							$scope.removeProxy = function (idx) {
								
								$scope.proxys.remove(idx);								
							}
							
							$scope.persistProxys = function () {

								console.log("Persisting proxys!");
								
							}
						}
					}
				}
				
			});
		}
	);

	this.app.run($state => { $state.go('opt-site') });
	
	angular.element(document).ready(
		() => {
			
			angular.bootstrap(document, ['optionsPageApp']);
			
		}
	);
}

browser.runtime.getBackgroundPage()
	.then(
		page => {
			
			window.onbeforeunload = function () {
				
				page.option_mgr.events = null;
				
			}
			
			OP.call(this, page);				
		}
	);

				
