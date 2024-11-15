// ACTIVAR/DESACTIVAR SIDEBAR

var sidebarOpen = false;
var sidebar = document.getElementById('sidebar');
const projectimage = document.getElementById('projectimage');
const projectimagefile = document.getElementById('projectimagefile');

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

projectimagefile.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            projectimage.src = e.target.result;
        };
        reader.readAsDataURL(file); 
    }
});

mainprojectimage = document.getElementById('mainprojectimage');
projectselect = document.getElementById('projectselect');
projectdescription = document.getElementById('projectdescription');
projectname = document.getElementById('projectname');

projectselect.addEventListener('change', function() {
    const selectedOption = projectselect.options[projectselect.selectedIndex];
    const imageUrl = selectedOption.getAttribute('data-image');
    const description = selectedOption.getAttribute('data-description'); 
    const name = selectedOption.getAttribute('data-name');
    console.log(imageUrl);
    if (imageUrl) {
        mainprojectimage.src = imageUrl; 
        mainprojectimage.style.display = 'block'; 
    } else {
        mainprojectimage.style.display = 'none'; 
        
    }
    if(name){
        projectname.textContent = name;
        projectname.style.display = 'block';
    }
    if (description) {
        projectdescription.textContent = description; 
        projectdescription.style.display = 'block'; 
    } else {
        projectdescription.style.display = 'none'; 
    }
});