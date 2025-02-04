
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

function openForm() {
    document.getElementById("add-role-Form").style.display = "block";
  }
  
  function closeForm() {
    document.getElementById("add-role-Form").style.display = "none";
  }
  document.addEventListener('mousedown', function handleClickOutsideBox(event) {
    const box = document.getElementById('add-role-Form');
    if (!box.contains(event.target)) {
      box.style.display = 'none';
    }
  });

var checkBox = document.querySelector(".form-check-input");
var text = document.querySelector(".delete");
function showDeleteStore(){
    if (checkBox.checked == true){
    text.style.display = "block";
  } else {
    text.style.display = "none";
  }
}
var checkBoxAll = document.querySelector(".check");
var deleteStore = document.querySelector(".delete");
function showDeleteAll(){

    if (checkBoxAll.checked == true){
    deleteStore.style.display = "block";
  } else {
    deleteStore.style.display = "none";
  }
}
const shiftToggleSwitch = document.querySelector('.create-role-toggle'); 
function animateToggleShift(){
    shiftToggleSwitch.classList.toggle("create-role-active");
}
const BOToggleSwitch = document.querySelector('.create-role-bo-toggle'); 
function animateToggleBO(){
    BOToggleSwitch.classList.toggle("create-role-bo-active");
}
