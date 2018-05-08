angular.module('tabtapPartials', ['jsonFormatter'])

	.directive('noInfo',
		() => {
				   
			return {
				restrict: 'E',
				replace: true,
				scope: {
					text: "=?"
				},
				template: '<div class="noInfoContainer"> {{ text || "No Data" }} </div>'
			}
		})

	.directive('dropDown',
		() => {
			
			return {
				restrict: 'E',
				replace: true,
				transclude: true,
				
				scope: {
					
					item: '=?',
					shown: '=?',
					flipped: '=?',
					width: "=?",
					height: "=?"
				},
				
				templateUrl: function (elem, attr) {
					return browser.extension.getURL("fg/partials/drop-down.html");
				},

				link: function($scope, element, attrs){
					
					$scope.obj = 'item' in attrs;
					
				},
				
				controller: function ($scope) {

					$scope.mostra = $scope.obj ? $scope.item.visible : $scope.$parent[$scope.shown];

					$scope.$watch(
						
						function () {
							
							return $scope.obj ? $scope.item.visible : $scope.$parent[$scope.shown];
							
						},
						
						function (nval, oval) {
							
							if (nval != oval)
								$scope.mostra = nval;
						}
					);
					
					$scope.toggleDD = function (ev) {
						
						$(ev.currentTarget).blur(); /* Avoid outline */
						$scope.mostra = !$scope.mostra;
						
						if ($scope.obj)
							$scope.item.visible = $scope.mostra;
						else 
							$scope.$parent[$scope.shown] = $scope.mostra;
					}
				}	
			}
		})
	
	.directive('ddTitle',
		() => {
			
			return {

				restrict: 'E',
				replace: true,
				transclude: true,
				
				scope: {
					val: '=',
					text: '='
				},
				
				templateUrl: function (elem, attr) {
					return browser.extension.getURL("fg/partials/drop-title.html");
				},

				controller: function ($scope) {
					
					$scope[$scope.val] = $scope.$parent[$scope.val];
					
					$scope.$watch(
						
						function () {
							
							return $scope[$scope.val];
							
						},
						
						function (modelValue) {
							
							$scope.$parent[$scope.val] = modelValue;
							
						}
					);
				}
			}
		})

	.directive('infoProtected', function() {
		
		return {
			
			restrict: "A",
			scope: false,
			
			link: function (scope, element) {
				
				element.on('blur', () => {

					element.attr('type', 'password');

				});

				element.on('focus', () => {

					element.attr('type', 'text');

				});
			}
		};
	})
	
	.directive('scriptStatus',
		() => {
			
			return {

				restrict: 'E',
				replace: true,
				scope: {
					status: "="
				},
				
				template: '<canvas width="24px" height="24px"></canvas>',
				
				link: function($scope, element, attr) {
					
					let color = $scope.status == "0" ? 'yellow' : ($scope.status == "1" ? 'green' : 'red');
					let context = element[0].getContext('2d');
					let centerX = element[0].width / 2;
					let centerY = element[0].height / 2;
					let radius = 10;
					
					context.beginPath();
					context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
					context.fillStyle = color;
					context.fill();
					context.lineWidth = 0;
					context.strokeStyle = color;
					context.stroke();
					
				}
			}
		})

	.directive('ngOnChange', function() {
		
		return {
			
			restrict: "A",
			scope: {
				ngOnChange: '&'
			},
			
			link: function (scope, element) {
				
				element.on('change', scope.ngOnChange);
			}
		};
	})
	
	.directive('scriptName',
			   () => {
				   
				   return {
					   
					   restrict: 'E',
					   
					   scope: {
						   script: "=script",
						   onlyval: '=?'
					   },
					   
					   template: '<bdi contenteditable="true"> {{script.name}} </bdi>',
					   
					   link: function($scope, element, attr) {
						   
						   element.on('input', function(ev) {
							   
							   if ($scope.tID)
								   clearTimeout($scope.tID);
							   
							   $scope.tID = setTimeout(
								   ev => {

									   let name = $(ev.target).text().trim();
									   
									   if (name.match(/^[a-z0-9]+$/i)) {

										   $scope.script.name = name;

										   if (!$scope.onlyval)
											   $scope.script.persist();
										   
									   } else 
										   $(ev.target).text($scope.script.name);
									   
								   }, 1000, ev
							   );
						   });
						   
						   element.keypress(ev => { return ev.which != 13; });
						   
						   element.on('click', ev => {
						   	   
							   if (ev.pageX > element.width()) {
								    
								   if (element.hasClass("shown"))
									   element.removeClass("shown");
								   else
									   element.addClass("shown");
								   
							   } else 
								   ev.stopImmediatePropagation();							      
						   });
					   }
				   }
			   })

	.directive('scriptIndex',
			   () => {
				   
				   return {
					   
					   restrict: 'E',
					   scope: {
						   
						   list: "=list",
						   parent: "=?parent",
						   editor: "=editor",
						   shown: "=shown",
						   opts: "=opts",
						   uuid: "=?uuid",
						   external: "=?external"
					   },

					   templateUrl: function (elem, attr) {
						   return browser.extension.getURL("fg/partials/script-index.html");
					   },
					   
					   controller: function ($scope, $timeout) {
						   
						   if (!$scope.parent)
							   $scope.parent = $scope.list[0].parent;
						   
						   if ($scope.parent.isGroup())
							   $scope.parent.elems = [];
						   
						   $scope.list_uuid = $scope.uuid || UUID.generate();
						   
						   $scope.parent.insertElem($scope.list_uuid, $scope.shown);
						   
						   $scope.list = $scope.list.map(
						   	   script => {
								   
								   /* Either this or remove script from shown list on script removal ... */
								   var elem = script.insertElem($scope.list_uuid, $scope.shown);
								   
								   if (elem.shown)
									   $scope.parent.elemFor($scope.list_uuid).show();
								   
								   return script;
						   	   }
						   );
						   
						   $scope.removeScript = function(script) {
							   
							   script.remove();
							   
						   };
						   
						   //console.log("New UUID for " + $scope.parent.parent.name + ": " + $scope.list_uuid);
						   
						   $timeout(() => {
							   
							   $('#' + $scope.list_uuid).find('code').each(
								   (i, block) => {
									   $(block).css("font-size", $scope.opts.fontSize + "pt");
								   }
							   );
						   });
					   } 
				   }
			   })

	.directive('httpRequest',
			   () => {
				   
				   return {
					   
					   restrict: 'E',
					   replace: true,
					   
					   scope: {
						   req: '=',
						   urlclick: '=',
						   toggle: '=',
						   remove: '=',
						   proxys: '='
					   },

					   templateUrl: function (elem, attr) {
						   return browser.extension.getURL("fg/partials/http-request.html");
					   },
					   
					   controller: function ($scope) {

						   $scope.proxying = false;
						   $scope.currentProxy = $scope.req.currentProxy;
						   $scope.open_lvl = 1;
						   $scope.config = false;
						   
						   $scope.showConfig = function () {

							   $scope.config = true;
							   
						   };
						   
						   $scope.showRuleAdder = function (req) {
							   
							   $scope.open_lvl = 2;
							   $scope.req.adding = true;
							   
						   };
						   
						   $scope.persistRule = function (action, data, headers) {
							   
							   $scope.open_lvl = 1;
							   $scope.req.listener.addFilter($scope.req.request,
															 {
																 action: action,
																 data: data,
																 headers: headers 
															 });
							   $scope.req.adding = false;
							   
							   if (!$scope.proxying)
								   $scope.config = false;
						   };

						   $scope.dismissRule = function () {

							   $scope.open_lvl = 1;
							   $scope.req.adding = false;
							   
							   if (!$scope.proxying)
								   $scope.config = false;
						   };

						   $scope.proxyChange = function () {
							   
							   $scope.req.listener.addProxyForHost($scope.currentProxy, $scope.req.request.url);
							   $scope.proxying = false;

							   if (!$scope.req.adding)
								   $scope.config = false;
						   };

						   $scope.showProxyOps = function () {
							   
							   $scope.proxying = true;
						   };

						   $scope.dismissProxy = function () {
							   
							   $scope.proxying = false;

							   if (!$scope.req.adding)
								   $scope.config = false;
						   };
					   }
				   }
			   })

	.directive('ruleAdder',
			   () => {
				   
				   return {
					   
					   restrict: 'E',
					   
					   scope: {
						   req: '=',
						   dismiss: '=',
						   add: '=',
					   },
					   
					   template: '<rule-chooser policies="policies" add="persist" dismiss="dismiss"></rule-chooser>',
					   
					   controller: function ($scope) {
						   
						   $scope.policies = ['block', 'redirect'];
						   $scope.headers = [];
						   
						   if ($scope.req)
							   $scope.policies.push('headers only');
						   
						   $scope.persist = function (policy, data) {

							   $scope.add(
								   policy,
								   data,
								   $scope.headers
							   )
						   };
						   
						   if ($scope.req) {
							   
							   $scope.req.events.on('header-change', (text, name) => {
								   
								   let stored = $scope.headers.find(
									   header => {

										   return header.name == name;
										   
									   }
								   );

								   if (stored)
									   stored.text = text;
								   else
									   $scope.headers.push({ name: name, value: text });
								   
							   });
						   }
					   },
				   }
			   })

	.directive('ruleChooser',
		() => {
			
			return {
				
				restrict: 'E',
				
				scope: {
					policies: '=',
					events: '=?',
					dismiss: '=?',
					add: '=?',
					url: '=?',
					policy: '=?',
				},
				
				templateUrl: function (elem, attr) {
					return browser.extension.getURL("fg/partials/rule-chooser.html");
				},
				
				controller: function ($scope) {
					
					$scope.policy = $scope.policy || 'block';
					$scope.backup = '';
					$scope.validated = $scope.url ? true : false;
					$scope.redirectUrl = $scope.url || '';
					
					$scope.urlChange = function () {
						
						$scope.validated = false;
						
						if($scope.ID)
							clearTimeout($scope.ID);
						
						$scope.ID = setTimeout(
							() => {
								
								if ($scope.redirectUrl != "") { 
										   
									try {
											   
										let url = new URL($scope.redirectUrl.startsWith("http") ? $scope.redirectUrl : "http://" + $scope.redirectUrl);
										
										$scope.redirectUrl = url.href;
										$scope.backup = $scope.redirectUrl;
											   
									} catch (e) {
										
										if (e instanceof TypeError) {
											
											console.error(e);
											$scope.redirectUrl = $scope.backup;
										}
									}
									
									$scope.validated = true;
									$scope.$digest();
										   
								} else
								$scope.validated = false;
									   
							}, 2000
						);
					};
					
					$scope.selectChange = function () {
						
						$scope.redirectUrl = "";
						
					};
					
					$scope.persist = function () {
						
						$scope.add(
							$scope.policy.split(' ')[0],
							($scope.policy == 'redirect' ? $scope.redirectUrl : null),
						);
					};

					if ($scope.events) {

						$scope.events.on('persist',
							() => {
								
								$scope.events.emit('persist-data', {
									
									id: 'policy',
									type: 'policy',
									value: {
										action: $scope.policy.split(' ')[0],
										url: $scope.policy == 'redirect' ? $scope.redirectUrl : null
									}
									
								});
								
							});
						
					}
				}, 
			}
		})
	
	.directive('ruleValue',
		() => {
			
			return {
				
				restrict: 'E',
				
				scope: {
					value: "=",
					type: "=",
					events: '=',
					idval: "="
						   
				},
				
				template: '<bdi contenteditable="true" placeholder="Enter value ... " ng-bind="value"></bdi>',
				
				link: function($scope, element, attr) {
					
					element.css({
						
						"min-width": "100%",
						"width": "100% !important",
						"height": "5px !important",
						"min-height": "5px !important",
						"padding-left": "10px",
						"text-overflow": "ellipsis",
						"overflow": "hidden",
						"outline": "none !important",
						"display": "inline-block"
					});
					
					element.on('input', function(ev) {
						
						if ($scope.tID)
							clearTimeout($scope.tID);
						
						$scope.tID = setTimeout(
							ev => {
								
								$scope.value = element.text().trim();
								
							}, 1200, ev
						);
					});
					
					element.keypress(ev => { return ev.which != 13; });
						   
					$scope.events.on('persist', () => {
						
						$scope.events.emit('persist-data', {
							id: $scope.idval,
							value: $scope.value,
								   type: $scope.type
						});
					})
				}
			}
		})
	
	.directive('hostValidator',
			   () => {
				   
				   return {
					   
					   restrict: 'E',
					   
					   scope: {
						   
 						   host: "=",
						   events: "="
						   
					   },
					   
					   template: '<bdi contenteditable="true" placeholder="Enter host name ... ">{{host}}</bdi>',
					   
					   link: function($scope, element) {
						   
						   element.on('input', $scope.validateHost);
						   
						   element.keypress(ev => { return ev.which != 13; });
						   element.click(ev => { return false; });
						   
						   /* !!! Ctrl-C - Ctrl-V */
					   },
					   
					   controller: function ($scope) {

						   $scope.backup = $scope.host;
						   
						   $scope.validateHost = function (ev) {
							   
							   $scope.host = $(ev.target).text().trim();
							   
							   if ($scope.events)
								   $scope.events.emit("validation_start", $scope.host);
							   
							   if($scope.changeID)
								   clearTimeout($scope.changeID);
							   
							   $scope.changeID = setTimeout(
								   ev => {
									   
									   try {
										   
										   var temp = new URL("http://" + $scope.host);

										   $scope.backup = temp.hostname;
										   
									   } catch (e) {

										   if (e instanceof TypeError) {

											   if ($scope.host != '*' && !$scope.host.startsWith("*.")) 
												   $scope.host = $scope.backup;
											   else 
												   $scope.backup = $scope.host;
										   }
									   }
									   
									   $(ev.target).text($scope.host);
									   
									   if ($scope.events)
										   $scope.events.emit("validation_ready", $scope.host);
									   
									   $scope.$digest();
									   
								   }, 800, ev);
						   };
						   
					   }
				   }
			   })

	.directive('groupValidator',
			   () => {
				   
				   return {
					   
					   restrict: 'E',
					   
					   scope: {
						   
 						   group: "=group",
						   ev: "=ev"
						   
					   },

					   transclude: true,

					   template: '<bdi style="display: inline-flex; flex-shrink: 0;" contenteditable="true"> {{group}} </bdi>',
					   
					   link: function($scope, element) {
					   
						   
						   element.on('input', $scope.validateGroup);
						   
						   element.keypress(ev => { return ev.which != 13; });
						   element.click(ev => { return false; });
						   
						   /* !!! Ctrl-C - Ctrl-V */
					   },

					   controller: function ($scope) {

						   $scope.backup = $scope.group;
						   
						   $scope.validateGroup = function (ev) {
	   
							   $scope.group = $(ev.target).text().trim();
							   
							   if ($scope.ev)
								   $scope.ev.emitEvent("validation_start", [$scope.group]);
							   
							   if($scope.changeID)
								   clearTimeout($scope.changeID);
							   
							   $scope.changeID = setTimeout(
								   ev => {
									   
									   if ($scope.group.match(/^[a-z0-9]+$/i))
										   $scope.backup = $scope.group;
									   else
										   $scope.group = $scope.backup;
									   
									   $(ev.target).text($scope.group);

									   if ($scope.ev)
										   $scope.ev.emitEvent("validation_ready", [$scope.group]);
									   
									   $scope.$digest();
									   
								   }, 800, ev);
						   }
					   }
				   }
			   })

	.directive('siteValidator',
			   () => {
				   
				   return {
					   
					   restrict: 'E',
					   
					   scope: {
						   
 						   url: "=url",
						   ev: "=ev"
						   
					   },

					   transclude: true,

					   template: '<bdi style="display: inline-flex; flex-shrink: 0;" contenteditable="true"> {{url}} </bdi>',
					   
					   link: function($scope, element) {
					   
						   // element.css({
						   // 	   "min-width": ((window.innerWidth/2) - 30) + "px"
						   // });
						   
						   element.on('input', $scope.validateSite);
						   
						   element.keypress(ev => { return ev.which != 13; });
						   element.click(ev => { return false; });
						   
						   /* !!! Ctrl-C - Ctrl-V */
					   },
					   
					   controller: function ($scope) {

						   try {

							   $scope.backup = new URL('http://' + $scope.url).sort();

						   } catch (e) {

							   $scope.backup = $scope.url;
						   }
						   
						   $scope.isSubDomain = function (orig, modified) {
							   
							   if (orig.endsWith("/"))
								   orig = orig.slice(0, -1);
							   
							   if (modified.endsWith("/"))
								   modified = modified.slice(0, -1);
							   
							   var mod_arr = modified.split(".");
							   var orig_arr = orig.split(".");
							   
							   var cursor_mod = mod_arr.length - 1;
							   var cursor_orig = orig_arr.length - 1;
							   
							   while ( (mod_arr[cursor_mod] != "*") &&
									   (mod_arr[cursor_mod] == orig_arr[cursor_orig])
									 ) {
								   
								   cursor_mod --;
								   cursor_orig --;	
							   }
							   
							   return mod_arr[cursor_mod] == "*";
						   };

						   $scope.isSubSet = function (orig, modified) {
							   
							   if (orig.endsWith("/"))
								   orig = orig.slice(0, -1);

							   if (modified.endsWith("/"))
								   modified = modified.slice(0, -1);
							   
							   var mod_arr = modified.split(".");
							   var orig_arr = orig.split(".");
							   
							   var cursor_mod = mod_arr.length - 1;
							   var cursor_orig = orig_arr.length - 1;
							   
							   while ((mod_arr[cursor_mod] == orig_arr[cursor_orig])) {

								   cursor_mod --;
								   cursor_orig --;	
							   }
							   
							   return mod_arr[cursor_mod] == "*" || orig_arr[cursor_orig] == "*";
						   };
						   
						   $scope.validateSite = function (ev) {
							   
							   $scope.url = $(ev.target).text().trim();
							   
							   if ($scope.ev)
								   $scope.ev.emitEvent("validation_start", [$scope.url]);
							   
							   if($scope.changeID)
								   clearTimeout($scope.changeID);
							   
							   $scope.changeID = setTimeout(
								   ev => {
									   
									   try {
										   
										   var temp = new URL("http://" + $scope.url);

										   try {
											   
											   if (temp.hostname != $scope.backup.hostname)
												   $scope.url = $scope.backup.name();	
											   else
												   $scope.backup = temp;

										   } catch (err) {
											   
											   /* String backup */
											   
											   if ($scope.isSubDomain(temp.hostname, $scope.backup))
												   $scope.backup = temp; 
											   else
												   $scope.url = $scope.backup;
											   
										   }
										   
									   } catch (e) {

										   if (e instanceof TypeError) {
											   
											   if (!$scope.url.startsWith("*.")) 
												   $scope.url = $scope.backup.name();
											   else {
												   
												   if ($scope.isSubDomain($scope.backup.hostname || $scope.backup, $scope.url.split("/")[0])) {
													   
													   $scope.url = $scope.url.split("/")[0]; /* "All subdomains" shortcut ... */
													   $scope.backup = $scope.url;
													   
												   } else {
													   
													   if ($scope.isSubSet($scope.backup.hostname || $scope.backup, $scope.url.split("/")[0])) 
														   $scope.backup = $scope.url;
													   else 
														   $scope.url = typeof($scope.backup) == "string" ? $scope.backup : $scope.backup.name();
												   }
											   }
										   }
									   }	  

									   if ($scope.url.slice(-1) == "/")
										   $scope.url = $scope.url.slice(0, -1);
										   
									   $(ev.target).text($scope.url);

									   if ($scope.ev)
										   $scope.ev.emitEvent("validation_ready", [$scope.url]);
									   
									   $scope.$digest();
									   
								   }, 800, ev);
						   };
						   
					   }
				   }
			   })

	.directive('aceInline',
			   () => {
				   
				   return {
					   
					   restrict: 'E',
					   
					   scope: {
						   
						   height: "=h",
						   width: "=w"
						   
					   },
					   
					   templateUrl: function (elem, attr) {
						   
						   return browser.extension.getURL("fg/partials/ace-frame.html");

					   },
					   
					   controller: function ($scope) {
						   
						   $scope.src = browser.extension.getURL("fg/partials/ace-inline.html");

					   }
					   
				   }
			   });
