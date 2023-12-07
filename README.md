
Este proyecto es una aplicación web que simula el funcionamiento de un concesionario de autos deportivos. Está construido utilizando Node.js y Express como el servidor web, EJS como motor de plantillas para la generación dinámica de páginas HTML, y se conecta a una base de datos MySQL para almacenar información sobre usuarios, autos disponibles y compras realizadas.

A continuación, se proporciona una descripción detallada de algunas características clave de la aplicación:

Manejo de Sesiones: Utiliza el módulo express-session para gestionar sesiones de usuario. Los usuarios pueden registrarse, iniciar sesión y cerrar sesión. La información de la sesión se utiliza para personalizar la experiencia del usuario, como mostrar el nombre del usuario autenticado en la interfaz.

Registro de Usuarios: Permite a los usuarios registrarse proporcionando un nombre de usuario, nombre y contraseña. La contraseña se almacena de forma segura mediante el uso de la biblioteca bcryptjs para el hash.

Inicio de Sesión: Los usuarios pueden iniciar sesión con sus credenciales. La aplicación realiza la verificación de usuario y contraseña utilizando bcrypt y mantiene la sesión del usuario para rastrear si están autenticados.

Tienda de Autos: Presenta una página de tienda donde se muestran autos deportivos disponibles para la compra. Los usuarios autenticados pueden comprar autos, y la información de la compra se almacena en la base de datos.

Carrito de Compras: Los usuarios autenticados pueden ver los autos que han comprado en su carrito de compras. La información se recupera de la base de datos y se muestra dinámicamente.

Prevención de Acceso No Autorizado: Algunas rutas requieren autenticación. Si un usuario no autenticado intenta acceder a estas rutas, se le redirige a la página de inicio de sesión.

Mensajes de Alerta: Utiliza mensajes de alerta para informar al usuario sobre el resultado de acciones como el registro, inicio de sesión o compra de un auto.

Limpiar Caché: Implementa una función middleware para evitar el almacenamiento en caché y garantizar que la información confidencial no quede en la caché después del cierre de sesión.
