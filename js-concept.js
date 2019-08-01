var elements = document.getElementsByTagName('input');
var n = elements.length;    // assume we have 10 elements for this example
for (var i = 0; i < n; i++) {
    elements[i].onclick = function() {
        console.log("This is element #" + i);
    };
}

var elements = document.getElementsByTagName('input');
var n = elements.length;    // assume we have 10 elements for this example
var makeHandler = function(num) {  // outer function
     return function() {   // inner function
         console.log("This is element #" + num);
     };
};
for (var i = 0; i < n; i++) {
    elements[i].onclick = makeHandler(i+1);
}

BaseObject = function(name) {
    if(typeof name !== "undefined") {
        this.name = name;
    } else {
        this.name = 'default'
    }
};

var firstObj = new BaseObject();
var secondObj = new BaseObject('unique');

console.log(firstObj.name);  // -> Results in 'default'
console.log(secondObj.name); // -> Results in 'unique'

delete secondObj.name;

console.log(secondObj.name); // -> Results in 'undefined'

BaseObject = function (name) {
    if(typeof name !== "undefined") {
        this.name = name;
    }
};

BaseObject.prototype.name = 'default';

var thirdObj = new BaseObject('unique');
console.log(thirdObj.name);  // -> Results in 'unique'

delete thirdObj.name;
console.log(thirdObj.name);  // -> Results in 'default'


var MyObject = function() {}

MyObject.prototype.whoAmI = function() {
    console.log(this === window ? "window" : "MyObj");
};

var obj = new MyObject();
var whoAmI = obj.whoAmI;
console.log(whoAmI);
function () {
    console.log(this === window ? "window" : "MyObj");
}

obj.whoAmI();  // outputs "MyObj" (as expected)
whoAmI();      // outputs "window" (uh-oh!)





