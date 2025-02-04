
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
    document.getElementById("add-store-Form").style.display = "block";
  }
  
  function closeForm() {
    document.getElementById("add-store-Form").style.display = "none";
  }
  document.addEventListener('mousedown', function handleClickOutsideBox(event) {
    const box = document.getElementById('add-store-Form');
    if (!box.contains(event.target)) {
      box.style.display = 'none';
    }
  });
function selectPeriod(){
document.getElementById('select-chart-period').style.display="block"
}
//The function of closing the  popup on click of anywhere on screen
document.addEventListener('mouseup', function handleClickOutsideBox(event) {
    const box = document.getElementById('select-chart-period');
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
