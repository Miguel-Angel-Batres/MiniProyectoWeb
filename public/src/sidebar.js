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

function toggleFilter(element){
    const filters = document.querySelectorAll(".filterbox");
    filters.forEach(filter => {
        filter.classList.remove('active');
    });
    element.classList.add('active');
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