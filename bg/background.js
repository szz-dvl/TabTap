function BG_mgr () {
	
	let self = this;

	this.app_events = null;
	this.option_mgr = new OptionMgr(self);
	this.tabs_mgr = new TabsMgr(self);
	this.rules_mgr = new RulesMgr(self);
	
	this.listenRequestsForCurrentTab = function () {

		browser.tabs.query({active: true, windowType: 'normal'})
			.then(
				tab_info => {
					self.tabs_mgr.openListenerInstance(tab_info[0]);
				}
			);
	}
	
	this.receiveCmd = function (command) {
		
		switch(command) {
				
			case "listen-request-for-tab":
				self.listenRequestsForCurrentTab();
				break;
				
			case "open-option-page":
				self.option_mgr.openPage();
				break;
				
			default:
				break;
		}
	};

	browser.commands.onCommand.addListener(this.receiveCmd);
	browser.browserAction.onClicked.addListener(this.listenRequestsForCurrentTab);
}

BG_mgr.call(this);
