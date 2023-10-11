/**
 * Layout of a scrabble board as used by all classic Scrabble(R)
 * editions
 */
define('editions/_Scrabble', () => {
	// Return a function, just in case different languages are used on
	// the same server. Each needs its own unique Edition.
	return () => {
		return {
			// Layout of lower-right quadrant, including middle row/col
			layout: [
				'M___d__T',
				'_d___d__',
				'__t___t_',
				'___D____',
				'd___D__d',
				'_d___D__',
				'__t___D_',
				'T___d__T',
			],
			swapCount: 7,      // tiles on rack
			rackCount: 7,      // tiles swappable in a move
			bonuses: { 7: 50 } // bonus for placing all 7 rack tiles
		};
	};
});
