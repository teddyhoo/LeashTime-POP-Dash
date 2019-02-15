window.onload = function() {
  document.getElementById('btn-save-contact').onclick = updateContactCard;
}

function updateContactCard() {
  //alert('RUNNING');
  var myValue = document.getElementById('email').value;
  alert(myValue);

}
