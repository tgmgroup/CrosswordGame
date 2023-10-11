/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env amd */

define('game/Bag', () => {
	class Bag {
		constructor(contents) {
			this.contents = contents ? contents.slice() : [];
		}

		add(element) {
			this.contents.push(element);
		}

		remove(element) {
			const index = this.contents.indexOf(element);
			if (index != -1) {
				return this.contents.splice(index, 1)[0];
			}
		}

		contains(element) {
			return this.contents.indexOf(element) != -1;
		}
	}
	return Bag;
});

