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

function activetaskform(element){
    element.style.display = 'none';
    document.getElementById('add-task').style.display = 'block';
}

function desactivetaskform(){
    document.getElementById('addtask-button').style.display = 'block';
    document.getElementById('add-task').style.display = 'none';
}

function activeprojectform(){
    div2 = document.getElementById('create-project-container');
    div1 = document.getElementById('project-container');
    div2.classList.add('active');
    div1.classList.add('inactive');
}
function desactiveprojectform(){
    div2 = document.getElementById('create-project-container');
    div1 = document.getElementById('project-container');
    div2.classList.remove('active');
    div1.classList.remove('inactive');
}
