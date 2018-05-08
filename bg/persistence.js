//browser.storage.local.clear();

function Storage () {

	/* To do: cacth error */
	var self = this;
	
	this.__get = function (cb, key) {
				
		browser.storage.local.get(key)
			.then(
				values => {
					
					// console.log("Getting: " + key);
					// console.log(values[key]);

					cb(values[key]);
			
				}, console.error
			);	
	};

	this.__set = function (key, val) {

		console.log("Persisting: " + key);
		console.log(val);
		
		var obj = {};
		obj[key] = val;
		
		return browser.storage.local.set(obj);
	};

	this.__remove = function (key) {

		console.log("Removing: " + key);
		
		return browser.storage.local.remove(key);
	};
	
	/* Rules: */
	this.setRules = function (rules) {
		
		return self.__set('rules', rules);
	}
	
	this.getRules = function (cb) {

		self.__get(rules => { cb(rules || []) }, 'rules');
	}
	
	this.removeRules = function () {
		
		return self.__remove('rules');
	}

	/* Proxy Rules: */
	this.setProxyRules = function (rules) {
		
		return self.__set('prules', rules);
	}
	
	this.getProxyRules = function (cb) {

		self.__get(rules => { cb(rules || []) }, 'prules');
	}
	
	this.removeProxyRules = function () {
		
		return self.__remove('prules');
		
	}

	/* Options: */
	this.getOptions = function (cb) {
		
		self.__get(cb, 'options');
		
	};
	
	this.setOptions = function (val) {
		
		return self.__set('options', val);
		
	};
	
	this.removeOptions = function () {
		
		return browser.storage.local.remove('options');

	};
}

let global_storage = new Storage();


