/** Suppose you want to model user interface buttons and labels with
 *  different shapes: Circular and Rectangular
 *  Each shape has a position and implement the methods
 *  area(), grow() and shrink()
 * 
 */

function Circle(radius) {
    this.radius = radius;
};
Circle.prototype.area = function() {
    return Math.PI * this.radius * this.radius;
};
var circle1 = new Circle(5);
console.log( circle1.area() )






// Suppose now that we want to let our circle be positionable elsewhere
var asPositionable = function() {
    this.x = this.x || 0;
    this.y = this.y || 0;

    this.position = function() {
        return { x: this.x, y: this.y}
    }
    this.setPosition = function( x, y ) {
        this.x = x;
        this.y = y;
    }
    this.translate = function( dx, dy ) {
        this.x += dx || 0;
        this.y += dy || 0;
    }
}

// We can mix the positionable behaviour with our already existing 
// Circle objects to let them be positionable
//
asPositionable.call( Circle.prototype );


console.log( circle1.position() );
circle1.translate(10,10);
console.log( circle1.position() );






// Similarly we can create a function to represent the "Circle"
// behaviour

var asCircle = function() {
    this.radius = this.radius || 1;

    this.area = function() {
      return Math.PI * this.radius * this.radius;
    };
    
    this.grow = function() {
      this.radius++;
    };
    
    this.shrink = function() {
      this.radius--;
    };

    asPositionable.call( this ); // Circle mix its behaviour with positionable seen before
    return this;
};



// And to present the Label behaviour
var asLabel = function() {
    this.label = this.label || "Unknown";
    this.printlabel = function() {
        console.log( this.label );
    }
}


// And button behaviour
var asButton = function() {
    this.click = function() {
        console.log("Button "+ (this.label || "") + " pressed");
    }
}



// And we can finally create our objects by mixing the behaviours
var MyCircularButton = function( label, radius) {
    this.label = label;
    this.radius = radius;
}
asCircle.call( MyCircularButton.prototype );
asLabel.call( MyCircularButton.prototype );
asButton.call( MyCircularButton.prototype );
var cb = new MyCircularButton( "test", 10 );
cb.click();
console.log("Button radius is " + cb.radius );

cb.translate( 20, 50 );
console.log("Button position is " + cb.position().x + " " + cb.position().y );



// Want a rectangular button? we can mix it in

var asRectangle = function() {
    this.area = function() {
        return this.w * this.h;
    }
    this.grow = function() {
        this.w++;
        this.h++;
    }
    this.shrink = function() {
        this.w--;
        this.h--;
    }
    asPositionable.call( this );
}

function RectangularButton( w, h, label ) {
    this.w = w;
    this.h = h;
    this.x = 0;
    this.y = 0;
    this.label = label;
}
asRectangle.call( RectangularButton.prototype );
asButton.call( RectangularButton.prototype );
asLabel.call( RectangularButton.prototype );

var rb = new RectangularButton(20,10,"button2");
console.log( rb.area() );
rb.printlabel();
rb.click();
console.log( rb.position() )
rb.translate(10,0);
console.log( rb.position() )

