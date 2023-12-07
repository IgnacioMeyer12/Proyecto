// - Invocamos a MySQL y realizamos la conexión
/*
  - Importamos el módulo 'mysql'.
  - Creamos una conexión a la base de datos utilizando variables de entorno para la información de conexión.
*/

const mysql = require('mysql');
const connection = mysql.createConnection({
    // Con variables de entorno
    host     : process.env.DB_HOST,      // Host de la base de datos
    user     : process.env.DB_USER,      // Usuario de la base de datos
    password : process.env.DB_PASS,      // Contraseña de la base de datos
    database : process.env.DB_DATABASE   // Nombre de la base de datos
});

// Establecemos la conexión a la base de datos
connection.connect((error) => {
    if (error) {
      console.error('El error de conexión es: ' + error);
      return;
    }
    console.log('¡Conectado a la Base de Datos!');
});

// Exportamos la conexión para que pueda ser utilizada en otros archivos
module.exports = connection;
