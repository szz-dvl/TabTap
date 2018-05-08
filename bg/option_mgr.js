function OptionMgr (bg) {

	let self = this;
	
	this.storage = global_storage;
	this.bg = bg;
	
	this.proxys = null;

	this.storage.getOptions(
		
		options => {
			
			self.proxys = options || {'example': {'host': 'localhost', port: 9050, type: 'socks'}}; 
			
		}
	);

	this.openPage = function() {
		
		browser.runtime.openOptionsPage();
		
	};

}
