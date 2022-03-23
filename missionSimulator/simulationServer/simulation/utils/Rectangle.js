/********************************************
* RECTANGLE CLASS
********************************************/
function Rectangle (x,y,width,height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

Rectangle.prototype.contains = function(x,y) {
	if (x >= this.x && x <= (this.x + this.width)
		&& y >= this.y && y <= this.y + this.height) {
		return true;
	}
	else {
		return false;
	}
}

Rectangle.prototype.top = function() {return this.y}
Rectangle.prototype.bottom = function () {return this.y + this.height};
Rectangle.prototype.left = function () {return this.x};
Rectangle.prototype.right = function () {return this.x + this.width};

module.exports = Rectangle;