function selectStore(){
    document.getElementById('select-store').style.display="block"
}
//The function of closing the select store popup in   on click of anywhere on screen
document.addEventListener('mouseup', function handleClickOutsideBox(event) {
  const box = document.getElementById('select-store');
  if (!box.contains(event.target)) {
    box.style.display = 'none';
  }
});

const shiftToggleSwitch = document.querySelector('.customer-information-toggle'); 
function animateToggleShift(){
    shiftToggleSwitch.classList.toggle("customer-information-active");
}
const timeClockToggleSwitch = document.querySelector('.customer-comments-toggle'); 
function animateToggleTimeClock(){
    timeClockToggleSwitch.classList.toggle("customer-comments-active");
}
function readFile(){
    var reader = new FileReader();
    var file = document.getElementById('upload').files[0];

    reader.onload = function(e){
        document.querySelector('.email-reciept-logo').src = e.target.result;
    }
    reader.readAsDataURL(file);
}
