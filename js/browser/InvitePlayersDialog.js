/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env browser, jquery */

/**
 * Dialog for game creation. Demand loads the HTML.
 */
define("browser/InvitePlayersDialog", ["browser/Dialog"], Dialog => {

	class InvitePlayersDialog extends Dialog {
		
		constructor(options) {
			super("InvitePlayersDialog", $.extend({
				title: $.i18n("Invite players")
			}, options));

			// Known users, got afresh from /users each time the
			// dialog is opened
			this.users = [];
		}

		createDialog() {
			super.createDialog();

			const $email = this.$dlg.find("#playerEmail");
			$email
			.on('change', () => this.pick($email.val()));
		}

		pick(name) {
			if (!name)
				return;
			let known = this.users.find(uo => (
				uo.name === name
				|| uo.email === name
				|| uo.key === name));
			if (!known) {
				known = { email: name };
				this.users.push(known);
			}

			const $list = this.$dlg.find("#invitedPlayers");
			let invited = false;
			$(".invitee").each(() => {
				if ($(this).data("uo") === known)
					invited = true;
			});
			if (invited)
				return;

			const $removeText = this.$dlg.find("#removeText");
			const $in = $("<span class='invitee'></span>")
				  .text((known.name || known.email))
				  .data("uo", known)
				  .on('click', function() {
					  $(this).remove();
					  if ($list.children().length === 0)
						  $removeText.hide();
				  });
			$list.append($in);

			$removeText.show();
		}

		openDialog() {
			super.openDialog();

			const $gk = this.$dlg.find("[name=gameKey]");
			$gk.val(this.options.gameKey);
			this.$dlg.find("#invitedPlayers").empty();
			this.invitees = [];
			this.$dlg.find("#removeText").hide();

			$.get("/users")
			.then(users => {
				this.users = users;
				const $select = this.$dlg.find("#knownUserSelect");
				$select.empty();
				$select.append(`<option></option>`);
				users.forEach(uo => $select.append(
					`<option value="${uo.key}">${uo.name}</option>`));
				$select
				.selectmenu({
					change: () => this.pick($select.val())
				});
			});
		}

		submit() {
			const ps = [];
			const $invitees = this.$dlg.find(".invitee");
			if ($invitees.length === 0) {
				this.$dlg.dialog("close");
				return;
			}
			$invitees.each(function() {
				ps.push($(this).data("uo"));
			});
			super.submit({ player: ps });
		}

		getAction() {
			return "invitePlayers";
		}
	}

	return InvitePlayersDialog;
});
