const projectselect = document.getElementById('projectselect');
const mainprojectimage = document.getElementById('mainprojectimage');
const projectname = document.getElementById('projectname');
const projectdescription = document.getElementById('projectdescription');
const projectimagefile = document.getElementById('projectimagefile');
const projectTask = document.getElementById('projectTask');

document.getElementById('projectimagefile').addEventListener('change', function(event) {
    const file = event.target.files[0];  

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            const projectimage = document.getElementById('projectimage');

            projectimage.src = e.target.result;  
            projectimage.style.display = 'block';  
        };

        reader.readAsDataURL(file); 
    }
});
document.addEventListener('DOMContentLoaded', function() {
    
    if (projectselect) {
        if (projectselect.options.length > 0) {
            addmember();
            const selectedOption = projectselect.options[projectselect.selectedIndex];
            const imageUrl = selectedOption.getAttribute('data-image');
            const description = selectedOption.getAttribute('data-description'); 
            const name = selectedOption.getAttribute('data-name');
    
            projectTask.value = selectedOption.value;
    
            if (imageUrl) {
                mainprojectimage.src = imageUrl; 
                mainprojectimage.style.display = 'block'; 
            } else {
                mainprojectimage.style.display = 'none'; 
            }
    
            if (name) {
                projectname.textContent = name;
                projectname.style.display = 'block';
            } else {
                projectname.style.display = 'none';
            }
    
            if (description) {
                projectdescription.textContent = description; 
                projectdescription.style.display = 'block'; 
            } else {
                projectdescription.style.display = 'none'; 
            }
            //cargar tareas
        const projectId = selectedOption.value;
        fetch(`/tasks/${projectId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(tasks => {
            //select members from project to make a task

            const taskList = document.getElementById('taskList');
            taskList.innerHTML = ''; 
            taskList.innerHTML = 
            `<div id="column_guide" class="task-list-header">
                  <h3>Task</h3>
                  <div class="task-list-header-right">
                    <h3>End Date</h3>
                    <h3>Status</h3>
                    <h3>Priority</h3>
                    <h3>Assignees</h3>
                  </div>
                </div>`; 

            if (tasks.length === 0) {
                taskList.innerHTML = '<div class="center-form"><h3>No tasks found</h3></div>';
            } else {
                tasks.forEach(task => {
                    const taskDiv = document.createElement('div');
                    taskDiv.classList.add('task-cuadro');
                    taskDiv.innerHTML = `
                        <div class="task-list-header">
                            <h3>Task</h3>
                            <div class="task-list-header-right">
                            <h3>End Date</h3>
                            <h3>Status</h3>
                            <h3>Priority</h3>
                            <h3>Assignees</h3>
                            </div>
                        </div>
                        <div class="task">
                            <h4>${task.name}</h4>
                            <div class="task-inner">
                                <h4>end date: ${task.enddate || 'N/A'}</h4>
                                <div class="task-status">
                                <h4>${task.status || 'not started'}</h4>
                                </div>
                                <div class="task-priority">
                                <h4>${task.priority || 'low'}</h4>
                                </div>          
                                <div class="task-assignees center-form">
                                <!-- Aquí irán las imágenes de los asignados -->
                                </div>
                            </div>
                        </div>
                    `;

                    // se agregan imágenes de los assignedUsers
                    const assigneeDiv = taskDiv.querySelector('.task-assignees');
                    if (task.assignedUsers && task.assignedUsers.length > 0) {
                        task.assignedUsers.forEach(user => {
                            const assigneeImg = document.createElement('img');
                            assigneeImg.src = user.img; 
                            assigneeImg.alt = user.name; 
                            assigneeImg.title = user.name; 
                            assigneeImg.classList.add('assignee-image');
                            assigneeDiv.appendChild(assigneeImg);
                        });
                    } else {
                        assigneeDiv.innerHTML += '<p>No assignees</p>';
                    }

                    taskList.appendChild(taskDiv);
                });
            }
        })
        .catch(error => {
            console.error('Error fetching tasks:', error);
        });
        // team members and admins
       fetch(`/members/${projectId}`)
       .then(response => response.json())
          .then(data => {
            const project_admins = document.getElementById('project_admins');
            project_admins.innerHTML = '';
            project_admins.innerHTML = `<h2>PROJECT ADMINS</h2>`;
            if(data.length === 0 || data === undefined){
                project_admins.innerHTML = '<div class="center-form"><h3>No admins found</h3></div>';
            }else{
                data.filter(admin => admin.role === 'admin').forEach(admin => {
                    const adminDiv = document.createElement('div');
                    adminDiv.classList.add('admin');
                    adminDiv.innerHTML = `
                        <img src="${admin.userId.img}" alt="${admin.userId.name}" title="${admin.userId.name}"
                            style="width: 50px;
                            height: 50px;
                            border-radius: 30px;
                            object-fit: cover;"/>
                        <h4>${admin.userId.name}</h4>
                    `;
                    project_admins.appendChild(adminDiv);
                });
            }
            const project_members = document.getElementById('project_members');
            project_members.innerHTML = '';
            project_members.innerHTML = `<h2>PROJECT MEMBERS</h2>`;
            
            if(data.length === 0 || data === undefined){
                project_members.innerHTML = '<div class="center-form"><h3>No members found</h3></div>';
            }else{
                data.forEach(member => {
                    const memberDiv = document.createElement('div');
                    memberDiv.classList.add('member');
                    memberDiv.innerHTML = `
                    <img src="${member.userId.img}" alt="${member.userId.name}" title="${member.userId.name}" 
                        style="width: 50px;
                        height: 50px;
                        border-radius: 30px;
                        object-fit: cover;"/>
                    <h4>${member.userId.name}</h4>
                    `;        
                    project_members.appendChild(memberDiv);
                });
            }
          })
          .catch(error => {
              console.error('Error fetching members:', error);
          });
      

        } else {
            const project_admins = document.getElementById('project_admins');
            const project_members = document.getElementById('project_members');
            project_admins.innerHTML = `<h2>PROJECT ADMINS</h2>
            <div class="admin center-form">
            <h3>No admins found</h3></div>`;
            project_members.innerHTML = `<h2>PROJECT MEMBERS</h2>
            <div class="member center-form"><h3>No members found</h3></div>`;
            mainprojectimage.src = 'https://img.freepik.com/vecteurs-premium/vecteur-icone-image-par-defaut-page-image-manquante-pour-conception-site-web-application-mobile-aucune-photo-disponible_87543-11093.jpg';
            mainprojectimage.style.display = 'block';
            projectselect.style.display = 'none';
            document.getElementById('addtask-button').style.display = 'none';
        }
       
        
        const firstDeleteIcon = document.querySelector('.dynamic-grid .column-form .delete-icon');
        if (firstDeleteIcon) {
        firstDeleteIcon.addEventListener('click', () => {
        const firstColumn = firstDeleteIcon.closest('.column-form');
        firstColumn.remove();
        renumberColumns(); 
            verifygrid();
        });
        }
        const firstDeleteIcon2 = document.querySelector('.dynamic-grid2 .column-form .delete-icon2');
        if(firstDeleteIcon2){
            firstDeleteIcon2.addEventListener('click', () => {
                const firstColumn = firstDeleteIcon2.closest('.column-form');
                firstColumn.remove();
                renumberColumns2();
                verifygrid2();
        });
        }

        }else{
            console.log('No hay elementos en el DOM');
        }

});


projectselect.addEventListener('change', function() {
    const selectedOption = projectselect.options[projectselect.selectedIndex];
    const imageUrl = selectedOption.getAttribute('data-image');
    const description = selectedOption.getAttribute('data-description'); 
    const name = selectedOption.getAttribute('data-name');

    projectTask.value = selectedOption.value;

    if (imageUrl) { 
        mainprojectimage.src = imageUrl; 
        mainprojectimage.style.display = 'block'; 
    } else {
        mainprojectimage.style.display = 'none'; 
    }

    if (name) {
        projectname.textContent = name;
        projectname.style.display = 'block';
    } else {
        projectname.style.display = 'none';
    }

    if (description) {
        projectdescription.textContent = description; 
        projectdescription.style.display = 'block'; 
    } else {
        projectdescription.style.display = 'none'; 
    }

    //cargar tareas
    const projectId = selectedOption.value;
    if(projectId){
        fetch(`/tasks/${projectId}`)
        .then(response => response.json())
        .then(data => {
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = ''; // Limpiar la lista antes de llenarla
             taskList.innerHTML = 
            `<div id="column_guide" class="task-list-header">
                  <h3>Task</h3>
                  <div class="task-list-header-right">
                    <h3>End Date</h3>
                    <h3>Status</h3>
                    <h3>Priority</h3>
                    <h3>Assignees</h3>
                  </div>
                </div>`; 

            

            if(data.length === 0){
                taskList.innerHTML = '<div class="center-form"><h3>No tasks found</h3></div>';
            }else{
            data.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.innerHTML = `
            <h4>${task.name}</h4>
            <div class="task-inner">
              <h4>end date: ${task.endDate || 'N/A'}</h4>
              <div class="task-status">
                <h4>${task.status || 'not started'}</h4>
              </div>
              <div class="task-priority">
                <h4>${task.priority || 'low'}</h4>
              </div>
              <div class="task-progress">
                <h4>${task.progress || '0%'}</h4>
              </div>
              <div class="task-assignees">
                <img src="${task.assigneeImg || 'default-image-url'}" alt="Assignee" />
              </div>
            </div>
             `;
            taskList.appendChild(taskDiv);
            
            })
            .catch(error => {
                console.error(error);
                taskList.innerHTML = '<div class="center-form"><h3>Error loading tasks</h3></div>';
            });

            }
            
        })
        .catch(error => {
            console.error(error);
            taskList.innerHTML = '<div class="center-form"><h3>Error loading tasks</h3></div>';
        });
    }

});


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
function toggleFilter(element){
    const filters = document.querySelectorAll(".filterbox");
    filters.forEach(filter => {
        filter.classList.remove('active');
    });
    element.classList.add('active');
}
function addmemberproject(){

    if(document.getElementById('members_formgroup2') === null){
        const member_input = document.getElementById('member_input2');
        //crear div 
        const newDiv = document.createElement('div');
        newDiv.id = 'members_formgroup2';
        newDiv.classList.add('form-group');
        newDiv.classList.add('center-form');
        newDiv.innerHTML = `
            <div class="dynamic-grid2"></div>`;
        //insertar el div en el html
        member_input.firstElementChild.insertAdjacentElement('afterend', newDiv);

    }

    const dynamicGrid = document.querySelector('.dynamic-grid2');
    //contar cuantos miembros hay
    const memberCount = dynamicGrid.querySelectorAll('.column-form').length + 1;
    //crear nuevo div de column-form
    if(memberCount <=12){
    const newColumn = document.createElement('div');
    newColumn.classList.add('column-form');
    //insertamos codigo html
    newColumn.innerHTML = `
      <label for="member">Assign Member ${memberCount}:</label>
      <div class="evenly">
        <input
          type="text"
          placeholder="Buscar usuario..."
          name="usuarios[]"
          list="usuarios-list2"
        />
      <datalist id="usuarios-list2">
        <% users.forEach(user => { %>
        <option value="<%= user._id %>"><%= user.name %></option> <!-- Usa el _id -->
        <% }) %>
        </datalist>
      <span class="material-symbols-outlined delete-icon2">delete</span>
      </div>
    `;
    
    //agregamos el nuevo div al grid
    dynamicGrid.appendChild(newColumn);
    const deleteIcon = newColumn.querySelector('.delete-icon2');
    deleteIcon.addEventListener('click', () => {
    // Elimina la columna correspondiente
    newColumn.remove();  
    // Renumerar las columnas después de eliminar
    renumberColumns2();  
    verifygrid2();
  });
  }
}
function addmember(){
    //comprobar si existe un id members_formgroup
    if(document.getElementById('members_formgroup') === null){
        member_input = document.querySelector('.member-input');
        //crear div 
        const newDiv = document.createElement('div');
        newDiv.id = 'members_formgroup';
        newDiv.classList.add('form-group');
        newDiv.classList.add('center-form');
        newDiv.innerHTML = `
            <div class="dynamic-grid"></div>`;
        //insertar el div en el html
        member_input.appendChild(newDiv);   
    }

    const dynamicGrid = document.querySelector('.dynamic-grid');
    //contar cuantos miembros hay
    const memberCount = dynamicGrid.querySelectorAll('.column-form').length + 1;
    //crear nuevo div de column-form
    if(memberCount <= 6){
    const newColumn = document.createElement('div');
    newColumn.classList.add('column-form');
    //insertamos codigo html
    const idselected = projectselect.options[projectselect.selectedIndex].value;

        // Filtra los usuarios del proyecto seleccionado
        const selectedProject = projectUsers.find(project => project._id === idselected);
        const assignedUsers = selectedProject ? selectedProject.assignedUsers : [];

        const userOptions = assignedUsers
            .map(user => `<option value="${user._id}">${user.name}</option>`)
            .join('');
            
            newColumn.innerHTML = `
            <label for="member">Assign Member ${memberCount}:</label>
            <div class="evenly">
              <input
                type="text"
                placeholder="Buscar usuario..."
                name="search_usuarios[]"
                list="usuarios-list-${memberCount}"
              />
              <datalist id="usuarios-list-${memberCount}">
                ${userOptions}
              </datalist>
              <span class="material-symbols-outlined delete-icon">delete</span>
            </div>
          `;
    
    //agregamos el nuevo div al grid
    dynamicGrid.appendChild(newColumn);
    const deleteIcon = newColumn.querySelector('.delete-icon');
    deleteIcon.addEventListener('click', () => {
    // Elimina la columna correspondiente
    newColumn.remove();  
    // Renumerar las columnas después de eliminar
    renumberColumns();  
    verifygrid();
  });
  }
}

// Función para renumerar las columnas
function renumberColumns() {
  const dynamicGrid = document.querySelector('.dynamic-grid');
  const columns = dynamicGrid.querySelectorAll('.column-form');

  columns.forEach((column, index) => {
    const label = column.querySelector('label');
    label.textContent = `Assign Member ${index + 1}:`; 
  });
}
function renumberColumns2() {
    const dynamicGrid = document.querySelector('.dynamic-grid2');
    const columns = dynamicGrid.querySelectorAll('.column-form');
  
    columns.forEach((column, index) => {
      const label = column.querySelector('label');
      label.textContent = `Assign Member ${index + 1}:`; 
    });
  }
function verifygrid(){
    const dynamicGrid = document.querySelector('.dynamic-grid');
    const columns = dynamicGrid.querySelectorAll('.column-form');
    if(columns.length === 0){
        //obtener el formgroup con queryselector
        formgroup = document.getElementById('members_formgroup');
        formgroup.remove();
    }
}
function verifygrid2(){
    const dynamicGrid = document.querySelector('.dynamic-grid2');
    const columns = dynamicGrid.querySelectorAll('.column-form');
    if(columns.length === 0){
        //obtener el formgroup con queryselector
        formgroup = document.getElementById('members_formgroup2');
        formgroup.remove();
    }
}