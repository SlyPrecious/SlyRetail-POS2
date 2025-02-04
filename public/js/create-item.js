function openCategory() {
    document.getElementById('category-dropdown').style.display = "block"
}
document.addEventListener('mouseup', function handleClickOutsideBox(event) {
    const box = document.getElementById('category-dropdown');
    if (!box.contains(event.target)) {
    box.style.display = 'none';
    }
});

const shiftToggleSwitch = document.querySelector('.shift-toggle'); 
function animateToggleShift(){
    shiftToggleSwitch.classList.toggle("shift-active");
}

var trackStock = document.querySelector('.shift-toggle');
var stock = document.querySelector('.stock-input');
function openStock(){
    if (stock.style.display == "block"){
        stock.style.display = "none"
    } else{
        stock.style.display = "block"
    }
}