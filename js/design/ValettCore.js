/**
 * Javascript port of Joshua Lewis' 'Valett' program. Ported because I
 * couldn't get my head round CoffeeScript, and the code is pretty
 * simple.
 * Copyright and license as described at https://github.com/jmlewis/valett
 */
/* eslint-env amd */

define('design/ValettCore', () => {

	function norm(vector) {
		let sum = 0;
		const normedVector = [];
		
		for (let num of vector)
			sum += num;
		
		for (let i = 0; i < vector.length; i++) {
			if (sum > 0)
				normedVector[i] = vector[i] / sum;
			else
				normedVector[i] = 0; // Ignore zero vectors
		}
		
		return normedVector;
	}

	function normMatrix(matrix) {
		const normedMatrix = [];
		for (let i = 0; i < matrix.length; i++)
			normedMatrix[i] = [];
		for (let i = 0; i < matrix.length; i++)
			normedMatrix[i] = norm(matrix[i]);
		return normedMatrix;
	}

	
	function transposeMatrix(matrix) {
		const transposedMatrix = [];
		for (let i = 0; i < matrix.length; i++)
			transposedMatrix[i] = [];
		
		for (let i = 0; i < matrix.length; i++)
			for (let j = 0; j < matrix.length; j++)
				transposedMatrix[i][j] = matrix[j][i];
		
		return transposedMatrix;
	}

	class Valett {

		/*
		 * @param {string[]} words word list
		 * @param {string[]} letters list of single-character strings
		 */
		constructor(words, letters) {
			this.words = words;
			this.letters = letters;
			this.hash = [];
			for (let i = 0; i < letters.length; i++)
				this.hash[letters[i]] = i;
			
			// maxLength
			this.maxLength = 0;
			for (let word of this.words)
				this.maxLength = Math.max(this.maxLength, word.length);

			// frequency
			this.frequency = [];
			for (let i = 0; i < this.letters.length; i++)
				this.frequency[i] = 0;
			for (let word of this.words)
				for (let letter of word.split(''))
					this.frequency[this.hash[letter]]++;

			// frequencyByLength
			this.frequencyByLength = [];
			this.totalFrequencyByLength = [];
			for (let i = 0; i < this.letters.length; i++) {
				this.frequencyByLength[i] = [];
				for (let j = 0; j < this.maxLength; j++)
					this.frequencyByLength[i][j] = 0;
			}
			for (let i = 0; i < this.maxLength; i++)
				this.totalFrequencyByLength[i] = 0
		
			for (let word of words) {
				this.totalFrequencyByLength[word.length - 1] += word.length;
				for (let letter of word.split('')) {
					this.frequencyByLength[this.hash[letter]][word.length - 1]++;
				}
			}
			
			for (let i = 0; i < this.letters.length; i++) {
				for (let j = 0; j < this.maxLength; j++)
					if (this.totalFrequencyByLength[j] !== 0)
						this.frequencyByLength[i][j] /= this.totalFrequencyByLength[j];
			}

			this._transitionFrequency();
			
			this._entropy();
		}

		analyze(maxValue, weights, frequencyByLengthWeights, entropyWeights) {
			while (frequencyByLengthWeights.length < this.maxLength)
				frequencyByLengthWeights.push(0);
			const normedFrequencyByLengthWeights = norm(frequencyByLengthWeights);
			const normedEntropyWeights = norm(entropyWeights);
		
			const entropyValues = [];

			const frequencyValues = norm(this.frequency);
			const frequencyByLengthValues = transposeMatrix(normMatrix(transposeMatrix(this.frequencyByLength)));
			entropyValues[0] = norm(this.entropy[0]);
			entropyValues[1] = norm(this.entropy[1]);

			// Calculate utility using weights
			const utility = [];
			for (let i = 0; i < this.letters.length; i++)
				utility[i] = { score: 0, count: frequencyValues[i] };

			for (let i = 0; i < this.letters.length; i++)
				utility[i].score += frequencyValues[i] * weights.frequency;
			
			for (let i = 0; i < this.maxLength; i++)
				for (let j = 0; j < this.letters.length; j++)
					utility[j].score += frequencyByLengthValues[j][i] * normedFrequencyByLengthWeights[i] * weights.frequencyByLength;
				

			for (let j = 0; j < this.letters.length; j++) {
				utility[j].score += entropyValues[0][j] * normedEntropyWeights[0] * weights.entropy;
				utility[j].score += entropyValues[1][j] * normedEntropyWeights[1] * weights.entropy;
			}

			// Invert and scale to [0, 1]
			let maxUtility = 0
			for (let i = 0; i < this.letters.length; i++) {
				utility[i].score = 1 / utility[i].score;
				maxUtility = Math.max(maxUtility, utility[i].score);
			}
			for (let i = 0; i < this.letters.length; i++)
				utility[i].score /= maxUtility;
		
			// Scale to desired range, could end up with zeros
			for (let i = 0; i < this.letters.length; i++)
				utility[i].score = Math.round(utility[i].score * maxValue);
		
			return utility;
		}
		
		_transitionFrequency() {
			this.transitionFrequency = [];
			for (let i = 0; i <= this.letters.length; i++) { // Extra slot for start/end of word
				this.transitionFrequency[i] = [] ;
				for (let j = 0; j <= this.letters.length; j++)
					this.transitionFrequency[i][j] = 0;
			}
			
			for (let word of this.words) {
				let i = 0;
				const wl = word.split('');
				for (let letter of wl) {
					let prevLetter = null;
					let nextLetter = null;
					let curLetter = null;
				
					if (i == 0) // Start of word
						prevLetter = this.letters.length;
					else
						prevLetter = this.hash[wl[i - 1]];
					
					if (i == word.length - 1) // End of word
						nextLetter = this.letters.length;
					else
						nextLetter = this.hash[wl[i + 1]];
					
					curLetter = this.hash[letter];
					
					if (curLetter) {
						if (prevLetter)
							this.transitionFrequency[prevLetter][curLetter]++;
						if (nextLetter)
							this.transitionFrequency[curLetter][nextLetter]++;
					}
				}
			}
		}

		_entropy() {
			const inOut = []
			inOut[0] = normMatrix(transposeMatrix(this.transitionFrequency));
			inOut[1] = normMatrix(this.transitionFrequency);
			
			// Prevent zero probability
			for (let i = 0; i <= 1; i++) {
				for (let j = 0; j < this.letters.length; j++)
					for (let k = 0; k < this.letters.length; k++)
						if (inOut[i][j][k] === 0)
							inOut[i][j][k] = .000000001;
			}
			this.entropy = [[], []];
			for (let i = 0; i <= 1; i++) {
				for (let j = 0; j < this.letters.length; j++) { // Ignore start/end
					this.entropy[i][j] = 0;
					for (let k = 0; k <= this.letters.length; k++)
						this.entropy[i][j] -= inOut[i][j][k] * (Math.log(inOut[i][j][k]) / Math.LN2);
				}
			}
		}
	}		
		
	return Valett;
});
