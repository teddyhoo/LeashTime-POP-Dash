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