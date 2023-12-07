// 0 - Invocamos a Express
const express = require('express'); // Importamos la biblioteca Express
const app = express(); // Creamos una instancia de la aplicación Express

// 1 - Configuración para capturar datos del formulario y uso de JSON
app.use(express.urlencoded({ extended: false })); // Middleware para procesar datos de formularios
app.use(express.json()); // Middleware para manejar datos en formato JSON

// 2 - Invocamos dotenv para cargar variables de entorno
const dotenv = require('dotenv'); // Importamos dotenv para cargar variables de entorno
dotenv.config({ path: './env/.env' }); // Configuramos la ruta del archivo de variables de entorno

// 3 - Seteamos el directorio de assets
app.use('/resources', express.static('public')); // Middleware para servir archivos estáticos en la ruta /resources
app.use('/resources', express.static(__dirname + '/public')); // Middleware adicional para la misma funcionalidad

// 4 - Establecemos el motor de plantillas (EJS en este caso)
app.set('view engine', 'ejs'); // Configuramos EJS como el motor de plantillas

// 5 - Invocamos bcrypt para el hashing de contraseñas
const bcrypt = require('bcryptjs'); // Importamos la biblioteca bcrypt para el hashing de contraseñas

// 6 - Variables de sesión con express-session
const session = require('express-session'); // Importamos express-session para manejar sesiones
app.use(session({
    secret: 'secret', // Clave secreta para firmar la cookie de sesión
    resave: true, // Forzar el almacenamiento de la sesión en cada solicitud
    saveUninitialized: true // Guardar sesiones no inicializadas
}));

// 7 - Invocamos la conexión a la base de datos
const connection = require('./database/db'); // Importamos el módulo de conexión a la base de datos

// 8 - Definición de rutas
// Página de inicio de sesión
app.get('/login', (req, res) => {
    res.render('login'); // Renderizamos la página de inicio de sesión
});

// Página de registro
app.get('/register', (req, res) => {
    res.render('register'); // Renderizamos la página de registro
});

// Página de tienda
app.get('/tienda', (req, res) => {
    res.render('tienda', {
        login: req.session.loggedin,  
    }); // Renderizamos la página de tienda con la información de la sesión
});

// Página del carrito
app.get('/carrito', (req, res) => {
    // Verifica si el usuario está autenticado
    if (!req.session.loggedin) {
        return res.redirect('/login'); // Redirigir a la página de inicio de sesión si no está autenticado
    }

    // Obtener el ID del usuario actual desde la sesión
    const userId = req.session.userId;

    // Consultar la base de datos para obtener los autos comprados por el usuario actual
    connection.query('SELECT * FROM autos WHERE user_id = ?', [userId], (error, results) => {
        if (error) {
            // Manejar el error si es necesario
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }

        // Renderizar la página de carrito con la información de los autos
        res.render('carrito', {
            login: req.session.loggedin,
            name: req.session.loggedin,
            autos: results // Pasar la lista de autos a la vista
        });
    });
});

// 9 - Método para la REGISTRACIÓN
// En este bloque de código, se maneja la solicitud de registro de un usuario.
app.post('/register', async (req, res) => {
    // Se obtienen los datos del cuerpo de la solicitud.
    const user = req.body.user; // Se extrae el nombre de usuario.
    const name = req.body.name; // Se extrae el nombre.
    const pass = req.body.pass; // Se extrae la contraseña.
    
    // Se realiza el hash de la contraseña utilizando bcrypt.
    let passwordHash = await bcrypt.hash(pass, 8);

    // Se ejecuta una consulta para insertar el nuevo usuario en la base de datos.
    connection.query('INSERT INTO users SET ?', { user: user, name: name, pass: passwordHash }, async (error, results) => {
        if (error) {
            // Si hay un error, se verifica si es debido a un usuario existente.
            if (error.errno === 1062) {
                // Se muestra un mensaje de alerta si el usuario ya existe.
                res.render('register', {
                    alert: true,
                    alertTitle: "No Estás Registrado",
                    alertMessage: "¡Usuario Existente!",
                    alertIcon: 'error',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: 'register'
                });
            }
        } else {
            // Se muestra un mensaje de alerta si el registro es exitoso.
            res.render('register', {
                alert: true,
                alertTitle: "Registration",
                alertMessage: "¡Successful Registration!",
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: ''
            });
        }
    });
});

// 10 - Venta de auto
// En este bloque de código, se maneja la solicitud de venta de un auto.
app.post('/tienda', async (req, res) => {
    // Se obtienen los detalles del auto desde el cuerpo de la solicitud.
    const marca = req.body.marca; // Se extrae la marca del auto.
    const modelo = req.body.modelo; // Se extrae el modelo del auto.
    const precio = req.body.precio; // Se extrae el precio del auto.
    const user_id = req.session.userId; // Se obtiene el ID del usuario de la sesión.
    const nameUsuario = req.session.name; // Se obtiene el nombre del usuario de la sesión.

    // Se ejecuta una consulta para insertar los detalles del auto en la base de datos.
    connection.query('INSERT INTO autos SET ?', { marca: marca, modelo: modelo, precio: precio, user_id: user_id, nameUsuario: nameUsuario }, (error, results) => {
        if (error) {
            // En caso de error, se imprime en la consola y se envía un mensaje de error al cliente.
            console.error(error);
            return res.status(500).send('Internal Server Error');
        } else {
            // Se muestra un mensaje de alerta si la compra es exitosa.
            res.render('tienda', {
                login: req.session.loggedin, 
                alert: true,
                alertTitle: "Gracias",
                alertMessage: "¡Compra Exitosa!",
                alertIcon: 'success',
                showConfirmButton: false ,
                timer: 2000,
                ruta: ''
            });
        }
    });
});

// 11 - Método para la autenticación
// En este bloque de código, se maneja la solicitud de autenticación de usuario.
app.post('/auth', async (req, res) => {
    // Se obtienen las credenciales de usuario desde el cuerpo de la solicitud.
    const user = req.body.user; // Se extrae el nombre de usuario.
    const pass = req.body.pass; // Se extrae la contraseña.
    
    // Se realiza el hash de la contraseña para compararla con la almacenada en la base de datos.
    let passwordHash = await bcrypt.hash(pass, 8);

    // Se verifica la existencia del usuario y la corrección de la contraseña.
    if (user && pass) {
        connection.query('SELECT * FROM users WHERE user = ?', [user], async (error, results, fields) => {
            if (results.length == 0 || !(await bcrypt.compare(pass, results[0].pass))) {
                // Se muestra un mensaje de error si las credenciales son incorrectas.
                res.render('login', {
                    alert: true,
                    alertTitle: "Error",
                    alertMessage: "USUARIO y/o PASSWORD incorrectas",
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'
                });
            } else {
                // Si la autenticación es exitosa, se guarda el ID del usuario en la sesión.
                req.session.loggedin = true;
                req.session.userId = results[0].id;
                req.session.name = results[0].name;

                // Se muestra un mensaje de éxito en el inicio de sesión.
                res.render('login', {
                    alert: true,
                    alertTitle: "Conexión exitosa",
                    alertMessage: "¡LOGIN CORRECTO!",
                    alertIcon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: ''
                });
            }
            res.end();
        });
    } else {
        // Se envía un mensaje de error si no se proporcionan usuario y contraseña.
        res.send('Please enter user and Password!');
        res.end();
    }
});

// 12 - Pagina de Inicio
app.get('/', (req, res) => {
    if (req.session.loggedin) {
        // Si está autenticado, se renderiza la página de inicio con los detalles del usuario.
        res.render('index', {
            login: true,
            name: req.session.name
        });
    } else {
        // Si no está autenticado, se renderiza la página de inicio con un mensaje de inicio de sesión necesario.
        res.render('index', {
            login: false,
            name: 'Debe iniciar sesión',
        });
    }
    res.end();
});

// 13 - Función para limpiar la caché después del cierre de sesión
// En este bloque de código, se define una función middleware para limpiar la caché después del cierre de sesión.
app.use(function (req, res, next) {
    if (!req.user)
        // Se establecen encabezados para evitar el almacenamiento en caché.
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    next();
});

// 14 - Cierre de sesión
// En este bloque de código, se maneja la solicitud de cierre de sesión.
app.get('/logout', function (req, res) {
    // Se destruye la sesión
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// 15 - Iniciar el servidor en el puerto 3000
// En este bloque de código, se inicia el servidor en el puerto 3000.
app.listen(3000, (req, res) => {
    // Se imprime en la consola un mensaje indicando que el servidor está en ejecución.
    console.log('SERVER RUNNING IN http://localhost:3000');
});
