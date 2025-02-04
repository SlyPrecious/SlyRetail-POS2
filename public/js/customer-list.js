
























function openSearch() {
    document.getElementById("search-item").style.display = "block";
  }
  
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
  function selectCategory(){
      document.getElementById('select-category').style.display="block"
  }
  //The function of closing the select category popup in   on click of anywhere on screen
  document.addEventListener('mouseup', function handleClickOutsideBox(event) {
      const box = document.getElementById('select-category');
      if (!box.contains(event.target)) {
        box.style.display = 'none';
      }
  });
  
  function selectStockAlert(){
      document.getElementById('stock-alert').style.display="block"
  }
  //The function of closing the view by stock alert popup in  timetable on click of anywhere on screen
  document.addEventListener('mouseup', function handleClickOutsideBox(event) {
      const box = document.getElementById('stock-alert');
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

  function openCountryList(){
    document.querySelector('.select-country').style.display="block"
}
//The function of closing the view by stock alert popup in  timetable on click of anywhere on screen
document.addEventListener('mouseup', function handleClickOutsideBox(event) {
    const box = document.querySelector('.select-country');
    if (!box.contains(event.target)) {
      box.style.display = 'none';
    }
});

