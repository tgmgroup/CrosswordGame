/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env browser, jquery */

define('browser/ChangePasswordDialog', ["browser/Dialog"], (Dialog) => {

	class ChangePasswordDialog extends Dialog {

		getAction() {
			return "change-password";
		}

		constructor(options) {
			options.done = (data) => {
				// Not an error, a statement
				$('#alertDialog')
				.text($.i18n.apply(null, data))
				.dialog({ modal: true });
			};

			super("ChangePasswordDialog", $.extend({
				title: $.i18n("Change password")
			}, options));
		}
	}
	
	return ChangePasswordDialog;
});
