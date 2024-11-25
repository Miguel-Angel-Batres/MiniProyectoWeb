// ACTIVAR/DESACTIVAR SIDEBAR

var sidebarOpen = false;
var sidebar = document.getElementById('sidebar');


function openSidebar(){
    if(!sidebarOpen){
        sidebar.classList.add('sidebar-responsive');
        sidebarOpen = true;
    }
}

function closeSidebar(){
    if(sidebarOpen){
        sidebar.classList.remove('sidebar-responsive');
        sidebarOpen = false;
    }
}

function toggleFilter(element,color){
    //change background color of element
    
    const filters = document.querySelectorAll(".filterbox");
    filters.forEach(filter => {
        filter.style.backgroundColor = "transparent";
        filter.style.border = '4px solid rgb(61, 68, 80)';
        filter.style.borderBottom = "none";
    });
    element.style.backgroundColor = color;
    element.style.borderColor = color;
    const bordernav= document.getElementById("filterheader");
    bordernav.style.borderBottomColor =  color;

    
}

function toggleDropdown(menuId) {
    document.querySelectorAll(".dropdown-menu").forEach((menu) => {
      if (menu.id !== menuId) {
        menu.classList.remove("active");
      }
    });

    const dropdownMenu = document.getElementById(menuId);
    dropdownMenu.classList.toggle("active");
  }