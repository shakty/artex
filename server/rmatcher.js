module.exports = RMatcher;

var J = require('nodegame-client').JSUS;

function RMatcher (options) {
	
	this.groups = [];

}


RMatcher.prototype.match = function() {
	
	for (var i = this.groups.length; i < this.groups.length ; i++) {
		this.groups[i].match();
	}
}

function Group() {
	
	this.elements = [];
	this.matched = [];

	this.leftOver = [];
	this.pointer = 0;
	
	this.matches = {};
	this.matches.total = 0;
	this.matches.requested = 0;
	
	this.rowLimit = 3;
	
	
	
	this.noSelf = true;
	
	this.pool = [];
	
	this.shuffle = true;
}

Group.prototype.init = function (elements, pool) {
	this.elements = (this.shuffle) ? J.shuffle(elements)
								   : elements;
	this.pool = pool;
	
	for (var i = 0 ; i < elements.length ; i++) {
		this.matched[i] = [];
	}
	
	this.matches.requested = this.elements.length * this.rowLimit;
};

/**
 * The same as canAdd, but does not consider row limit
 */
Group.prototype.canSwitchIn = function (x, row) {
	// Element already matched 
	if (J.in_array(x, this.matched[row])) return false;
	// No self
	if (this.noSelf && this.elements[row] === x) return false;
	
	return true;
};


Group.prototype.canAdd = function (x, row) {
	// Row limit reached
	if (this.matched[row].length >= this.rowLimit) return false;
	
	return this.canSwitchIn(x, row);
};

Group.prototype.shouldSwitch = function (x, fromRow) {
	if (!this.leftOver.length) return false;
	if (this.matched.length < 2) return false;
//	var actualLeftOver = this.leftOver.length;
	return true;
	
};

// If there is a hole, not in the last position, the algorithm fails
Group.prototype.switchIt = function () {
	
	for (var i = 0; i < this.elements.length ; i++) {
		if (this.matched[i].length < this.rowLimit) {
			this.completeRow(i);
		}
	}
	
};

Group.prototype.completeRow = function (row) {
	var clone = this.leftOver.slice(0);
	for (var i = 0 ; i < clone.length; i++) {
		for (var j = 0 ; j < this.elements.length; j++) {
			if (this.switchItInRow(clone[i], j, row)){
				this.leftOver.splice(i,1);
				return true;
			}
			this.updatePointer();
		}
	}
	return false;
}


Group.prototype.switchItInRow = function (x, toRow, fromRow) {
	if (!this.canSwitchIn(x, toRow)) {
		//console.log('cannot switch ' + x + ' ' + toRow)
		return false;
	}
	//console.log('can switch: ' + x + ' ' + toRow + ' from ' + fromRow)
	// Check if we can insert any of the element of the 'toRow'
	// inside the 'toRow'
	for (var i = 0 ; i < this.matched[toRow].length; i++) {
		var switched = this.matched[toRow][i];
		if (this.canAdd(switched, fromRow)) {
			this.matched[toRow][i] = x;
			this.addToRow(switched, fromRow);
			return true;
		}
	}
	
	return false;
};

Group.prototype.addToRow = function(x, row) {
	this.matched[row].push(x);
	this.matches.total++; 
}

Group.prototype.addIt = function(x) {
	var counter = 0, added = false;
	while (counter < this.elements.length && !added) {
		if (this.canAdd(x, this.pointer)) {
			this.addToRow(x, this.pointer);
			added = true;
		}
		this.updatePointer();
		counter++;
	}
	return added;
}


Group.prototype.match = function() {
	// Loop through the pools: elements in lower  
	// indexes-pools have more chances to be used
	for (var i = 0 ; i < this.pool.length ; i++) {
		for (var j = 0 ; j < this.pool[i].length ; j++) {
						
			// Try all positions
			if (!this.addIt(this.pool[i][j])) {
				// if we could not add it as a match, it becomes leftover
				this.leftOver.push(this.pool[i][j]);
			}
		}
	}
	
	if (this.shouldSwitch()) {
		this.switchIt();
	}
	
	if (this.leftOver.length) {
		console.log('Something did not work well..');
	}
	
	console.log('left over: ', this.leftOver);
	console.log('hits: ' + this.matches.total + '/' + this.matches.requested);
	
};

Group.prototype.updatePointer = function () {
	this.pointer = (this.pointer + 1) % this.elements.length;
}


var pool = [ [1, 1, 1, 2, 2, 2], [3, 3, 3, 4, 4, 4], ];
var elements = [7, 1, 2, 4];

var g = new Group();
g.init(elements, pool);
g.match();

console.log(g.elements);
console.log(g.matched);

