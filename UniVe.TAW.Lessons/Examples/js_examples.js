/************************************************
// Prototypes
var a = {title:"Javascript", pages:20 }
var arr = new Array();

// Prototype of any object can be retrieved using
// the static method Object.getPrototypeOf(..)
console.log( Object.getPrototypeOf(a) );    // Object.prototype
console.log( Object.getPrototypeOf(arr) );  // Array.prototype

// Method isPrototypeOf can be used to check
// if one object is a prototype of another one
console.log( Object.prototype.isPrototypeOf(a) );
console.log( Object.prototype.isPrototypeOf(arr) );
console.log( Array.prototype.isPrototypeOf(arr) );
console.log( Array.prototype.isPrototypeOf(a) );

/**/

/************************************************
// Object property override

var unitcircle = {
    radius: 1
};

var c = Object.create( unitcircle );
console.log(c.radius);     // c inherits the radius property
c.x = 10;                  // properties added to c
c.y = 20;
console.log( c.x );
c.radius = 20;             // c overrides its inherited property
console.log( c.radius );
console.log( unitcircle.radius );

/**/

/************************************************
// Conditional declaration test (works on node, fails in some 
// browser implementations)

var score=20;

    function evaluate() {
        console.log( "Exam passed");
    }
    function evaluate() {
        console.log( "Exam not passed");
    }
if( score>18 )
{
}
else
{
}
evaluate();

/************************************************
// Variable Hoisting test

var a = 'global';
function test()
{
    console.log(a); // prints "undefined" and not "global"
    var a = 'local';
    console.log(a); // prints "local"
}

test();

/**/

/************************************************
// Function Hoisting test

function function_hoisting()
{
    a(); // Prints "Hello" even if a has not been declared yet

    //{
    function a()
    {
        console.log("Hello");
    }
    //}
    //var a = function() { console.log("Hello"); }
}

function_hoisting();

/**/

/************************************************
// Lambda test

// sum
//var r = [5, 10, 5].reduce( function(accumulator,curr) {  return accumulator+curr; } );
//max
var r = [5, 10, 5].reduce( function(accumulator,curr) {  return curr>accumulator?curr:accumulator; }, 0 );
console.log( r );

/**/

/************************************************
// this test

// in browser, this refer to window object if invoked in global scope

function f() {
    console.log(this); // object of type "global"
}

f();

function f2() {
    "use strict";
    console.log(this); // undefined
}

f2();

var o = {
    prop: 10,
    f: function() { return this.prop; } // function invoked as method
}
console.log( o.f() );

// "this" in the prototype chain refers to the object on which the
// method is invoked, not the object that actually contains the method
var o2 = Object.create(o);
o2.prop = 20;
console.log( o2.f() );

function printprop() { 
    console.log(this.prop); 
};

// When call is used, this refer to the object passed as the first argument
printprop.call( o );  
                      

/**/


/************************************************
// Closures

var scope = "global scope";
function checkscope() {
	var scope = "local scope";
	function f() { return scope; }
	return f;
}
console.log( checkscope()() );


// A couple of useful idioms using closures

// 1) Singleton
var unique_integer = (function() {
    var counter = 0;
    return function() { return counter++; }
})();

console.log( unique_integer() );
console.log( unique_integer() );
console.log( unique_integer() );

// 2) Closure used to implement private variables
console.log("---")

function counter() {
    var n=0;  // private variable we want to hide
    return {
        count: function() { return n++; }, // Both count and reset share the same scope (variable n is shared)
        reset: function() { n=0; }
    };
}

// Every counter() invocation creates a new scope chain. Variable n is private in each chain
var a = counter(); 
var b = counter();

// Two counters are independent. Each function have a different scope chain, one for each
// invocation of counter()
console.log( a.count() ); 
console.log( b.count() );
b.reset();
console.log( a.count() );
console.log( b.count() );

/**/ 

/************************************************
// Arguments

function argtest( a, b, c ) {
    console.log("a: " + a );
    console.log("b: " + b );
    console.log("c: " + c );
}
argtest(3,"hello");

function show_arguments() {
    for(var i = 0; i < arguments.length; i++)
        console.log("Arg " +i+ ":" + arguments[i] );
}
show_arguments(1,2,3,"abc");


/**/ 


/************************************************
// Class constructor

// Suppose we want to create a class "Range" describing a range
// of values. We start by defining a constructor (which is just a Javascript function)

function Range( from, to ) {
    // When Range is invoked with new, this will refere to the newly created object.
    // NOTE: if we call Range() without new we will pollute the global object (so it
    // is a good idea to use strict mode for constructors)
    this.from = from; 
    this.to = to;
}

// Since Range function is also an object, it has the "prototype" property.
// By modifying the function prototype we can define all the properties of
// all the instances of class Range
Range.prototype = {

    includes:  function( x ) {
        // Returns true if x is in range
        return this.from <= x && x <= this.to;
    },

    foreach: function( f ) {
        // Invokes f for each element in the range
        for( var i=this.from; i<=this.to; ++i )
            f(i);

    },

    toString: function() {
        return "Range [" + this.from + " ... " + this.to + "]";
    }
}

// Some tests
var r = new Range(1,5); // <-- we use new to create a new instance of Range class
console.log(r.includes(3) );
console.log( r.toString() );
r.foreach( console.log );


// The identity of a class depends by the object prototype, not the constructor
// used to build it. Two objects can be instance of the same class even if they 
// have been built with different constructors but have the same prototype
function RangeDefault() {
    this.from = 0;
    this.to = 10;
}
RangeDefault.prototype = Range.prototype;

var rd = new RangeDefault();
console.log( rd.toString() );
console.log( rd instanceof Range ); // true
console.log( Range.prototype.isPrototypeOf(rd) ); // true


// Here we demonstrate that we can dynamically add methods or properties to
// all the existing objects of a class

var s = "test"; // First we instantiate a new String

String.prototype.strWithSpaces = function() {
    // Then we add a new method to all the strings
    var out ="";

    for (var idx=0; idx<this.length; ++idx ) {
        out = out + this[idx] + " ";
    }

    return out;
}

// Object s, instantiated before our modification, dinamically acquires
// the new method
console.log( s.strWithSpaces() )

/**/ 
/************************************************
// Public and private properties

// Let's modify the Range class to let from and to 
// properties private

function Range( from, to ) {

    // The basic idea is to use closures instead

    this.from = function() { return from; } 
    this.to = function() { return to; }  
}

// We also modify the Range methods
Range.prototype = {

    includes:  function( x ) {
        return this.from() <= x && x <= this.to();
    },

    foreach: function( f ) {
        for( var i=this.from(); i<=this.to(); ++i )
            f(i);

    },
    toString: function() {
        return "Range [" + this.from() + " ... " + this.to() + "]";
    }
}

var r = new Range(1,5);
console.log(r.includes(3) );
console.log( r.toString() );

// WARNING: from and to properties behave as private but the whole object
// remain mutable unless we use specific ES5 features to let the properties
// being immutables

r.from = function() { return 3; }
console.log( r.toString() );

/**/


/************************************************/
// Subclassing
// We create a class RangeStep to represent a range of values
// with a certain step (ex: RangeStep(2,8,2) = [2 4 6 8])

function Range( from, to ) {
    this.from = function() { return from; } 
    this.to = function() { return to; }     
}
Range.prototype = {

    includes:  function( x ) {
        return this.from() <= x && x <= this.to();
    },
    foreach: function( f ) {
        for( var i=this.from(); i<=this.to(); ++i )
            f(i);

    },
    toString: function() {
        return "Range [" + this.from() + " ... " + this.to() + "]";
    }
}

function RangeStep( from, to, step) {
    Range.apply( this, arguments );
    this.step = function() { return step; };
}

RangeStep.prototype = Object.create(Range);  // the actual subclassing operation. 
                                             // Object.create creates a new object with Range as prototype
//RangeStep.prototype.constructor = RangeStep; 

// Override some methods
RangeStep.prototype.toString = function(x) {
    out = "Range: [ ";
    for( var i=this.from(); i<this.to(); i+=this.step() ) {
        out = out + i + " ";
    }
    out = out + this.to() + " ]";
    return out;
}

RangeStep.prototype.includes = function(x) {
    // We use call() to invoke the superclass
    return Range.prototype.includes.call(this,x) && (x-this.from())%this.step() == 0 || x==this.to() ;
}

var rs = new RangeStep( 2, 9, 2 );
console.log( rs.toString() );
for( var ii=0; ii<12; ++ii ) {
    console.log(ii + ") " + rs.includes(ii) );
}

/**/

/************************************************
// Modules

// Example of the module design pattern

var MyModule = (function() {
    var private_field = "test";
    return {
        hello: function() { console.log("hello " + private_field ); },
        sum: function(a,b) { return a+b; }
    }
}());

MyModule.hello();
console.log( MyModule.sum(1,3) );

/**/

/************************************************
// Hoisting and ES6

function hoisting_test()
{
    console.log(a);
    //let a = 10;    //ES6 allows the usage of "let" keyword to disable hoisting
    var a = 20;
    console.log(a);
}

hoisting_test();
/**/

/************************************************
// Arrow functions

function log_function_output( f, args )
{
    console.log( f(args) );
}

log_function_output( function(){ return "hello1"; } );
log_function_output( () => { return "hello2"} );

var helloname = (n) => { return "hello " + n; }
log_function_output( helloname, "Filippo" );


var ScopePreservingExample = {
  text: "Property from lexical scope",
  run1: function() {
    setTimeout(() => {
      console.log(this.text); // this refers to ScopePreservingExample
    }, 1000);
  },
  run2: function() {
    setTimeout(function(){
      console.log(this.text); // this is a Timeout object
    }, 1000);
  },
  run3: function() {
      var myself = this;
    setTimeout(function(){
      console.log(myself.text); // myself refers to ScopePreservingExample via closures 
    }, 1000);
  }
};
ScopePreservingExample.run1();
ScopePreservingExample.run2();
ScopePreservingExample.run3();

/**/
