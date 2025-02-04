
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
