/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env browser, jquery */

/**
 * Dialog for robot creation. Demand loads the HTML.
 */
define("browser/AddRobotDialog", ["browser/Dialog"], (Dialog) => {

	class AddRobotDialog extends Dialog {
		
		constructor(options) {
			super("AddRobotDialog", $.extend({
				title: $.i18n("Add robot")
			}, options));
		}

		createDialog() {
			super.createDialog();

			let promise;
			$.get("/defaults")
			.then(defaults => Promise.all([
				$.get("/dictionaries")
				.then(dictionaries => {
					const $dic = this.$dlg.find('#dictionary');
					dictionaries
					.forEach(d => $dic.append(`<option>${d}</option>`));
					if (defaults.dictionary)
						$dic.val(defaults.dictionary);
					$dic.selectmenu();
					$dic.on('selectmenuchange', () => this.validate());
					this.validate();
				})
			]));
		}

		openDialog() {
			super.openDialog();
			const $gk = this.$dlg.find("[name=gameKey]");
			$gk.val(this.options.gameKey);
		}

		getAction() {
			return "addRobot";
		}
	}

	return AddRobotDialog;
});
