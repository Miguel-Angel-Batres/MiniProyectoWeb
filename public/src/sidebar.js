document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    
    const toggleSidebar = () => {
        sidebar.classList.toggle('open'); 
    };

    toggleButton.addEventListener('click', (event) => {
        event.stopPropagation(); 
        toggleSidebar();
    });

    const menuItems = document.querySelectorAll('.sidebar > a');

    menuItems.forEach(item => {
        item.addEventListener('click', (event) => {
            event.stopPropagation(); // Detener la propagación del clic en los elementos del menú
            const submenu = item.nextElementSibling;
            if (submenu && submenu.classList.contains('submenu')) {
                submenu.classList.toggle('open');
            }
        });
    });

    // Evitar que el clic en el sidebar cierre el sidebar
    sidebar.addEventListener('click', (event) => {
        event.stopPropagation(); // Detener la propagación del clic dentro del sidebar
    });

    // Cerrar el sidebar si el clic es fuera del sidebar
    document.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });
});
