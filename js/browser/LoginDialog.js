/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env browser, jquery */

define('browser/LoginDialog', ["browser/Dialog"], Dialog => {

	class LoginDialog extends Dialog {

		validate() {
			if (this.getAction() === "register") {
				const user = this.$dlg.find('#register_username').val();
				return (user
						&& user !== $.i18n("Advisor")
						&& user !== $.i18n("Robot"));
			}
			return true;
		}

		getAction() {
			const active = this.$dlg.find("#tabs").tabs("option", "active");
			return {
				0: "login",
				1: "register",
				2: "reset-password"
			}[active];
		}

		createDialog() {
			const $tabs = this.$dlg.find("#tabs");
			$tabs.tabs();

			const $las = this.$dlg.find("#logged-in-as");
			if ($las.length > 0) {
				$.get("/session")
				.then(user => $las.text(
					$.i18n('um-logged-in-as', user.name)));
			}
			
			this.$dlg.find(".forgotten-password")
			.on("click", () => $tabs.tabs("option", "active", 2));

			$.get("/oauth2-providers")
			.then(list => {
				if (!list || list.length === 0)
					return;
				const $table = $("<table width='100%'></table>");
				for (let provider of list) {
					const $td = $("<td></td>")
						  .addClass("provider-logo")
						  .attr("title", $.i18n("Sign in using $1", provider.name));
					const $logo = $(`<img src="${provider.logo}" />`);
					// Note: this MUST be done using from an href and
					// not an AJAX request, or CORS will foul up.
					const $a = $("<a></a>");
					$a.attr("href", `/oauth2/login/${provider.name}?origin=${encodeURI(window.location)}`);
					$a.append($logo);
					$td.append($a);
					$td.tooltip();
					$table.append($td);
				}
				$("#login-tab")
				.prepend($(`<div class="sign-in-using">${$.i18n("Sign in using:")}</div>`)
						 .append($table)
						 .append(`<br /><div class="sign-in-using">${$.i18n("or sign in as XANADO user:")}</div>`));
			});

			super.createDialog();
		}

		constructor(options) {
			const ddone = options.done;
			options.done = data => {
				if (this.getAction() === 'register') {
					$('#alertDialog')
					.text($.i18n("Welcome to XANADO, $1!", data.name))
					.dialog({
						modal: true,
						title: $.i18n("New player registered")
					});
				}
				if (typeof ddone === 'function')
					ddone(data);
			};
			super("LoginDialog", $.extend({
				title: $.i18n("Sign in")
			}, options));
		}
	}
	
	return LoginDialog;
});
