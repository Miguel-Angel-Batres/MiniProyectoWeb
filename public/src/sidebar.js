// public/script.js
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    
    // Función para alternar la visibilidad del sidebar
    const toggleSidebar = () => {
        sidebar.classList.toggle('open');
    };

    // Añadir evento al botón toggle
    toggleButton.addEventListener('click', toggleSidebar);

    // Manejar clics en las opciones del menú
    const menuItems = document.querySelectorAll('.sidebar > ul > li');

    menuItems.forEach(item => {
        item.addEventListener('click', (event) => {
            // Evitar que el clic en el <li> cierre la barra lateral
            event.stopPropagation();

            // Cerrar otros submenús
            menuItems.forEach(i => {
                if (i !== item) {
                    const submenu = i.querySelector('.submenu');
                    if (submenu) {
                        submenu.classList.remove('open');
                    }
                }
            });

            // Toggle de la subopción correspondiente
            const submenu = item.querySelector('.submenu');
            if (submenu) {
                submenu.classList.toggle('open');
            }
        });
    });

    // Cierra el sidebar cuando se hace clic fuera de él
    document.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });
});