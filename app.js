var Hapi = require('hapi');

var server = new Hapi.Server();
var keys = {};

/**
 * Datos de prueba iniciales que representan a la base de datos,
 * cuando la aplicación inicializa devuelve estos datos, y permite
 * modificarlos mientras viva el proceso servidor, si se cierra y
 * vuelve a iniciar se restauran todos los datos al estado inicial.
 *
 * Los usuarios de la aplicación son:
 *
 *        username: joe
 *        passwd: 123123
 *        role: fotografo
 *
 *        username: ray
 *        passwod: 123123
 *        role: etiquetador
 *
 */
var db = {};
db.photos = [{
    id: 123,
    event_id: 3399,  // será una foto de la carrera 'Dua Azul'.
    file: "dogrun_0964_FRU",
    runners: ["123", "345"],
    keywords: "keyword", // Los tags
    photographer_id: 1
  },
];

db.events = [ {
    id: 1233,
    title: '10K River Plate',
    where: 'Palermo - Capital Federal, Argentina',
    date: '08 de diciembre del 2014'
  }, {
    id: 3399,
    title: 'Dua Azul',
    where: 'Azul - Buenos Aires, Argentina',
    date: '11 de mayo del 2014'
  },
];

function get_auth_user(req) {
  var token = req.headers.token;
  var user = keys[token];

  if (!user) {
    console.log("Falla autorización del usuario.");
  } else {
    console.log("Autorizando a", user);
  }

  return user;
}

server.connection({
  host: '0.0.0.0',
  port: 8000
});

server.route({
  method: 'GET',
  path:'/',
  handler: function (request, reply) {
    var host = "http://" + request.headers.host;

    reply({
      login_url: host + "/clients/login/",
      events_url: host + "/events/",
      photos_url: host + '/photos/',
      debug_keys_url: host + '/keys/',
      debug_clear_keys_url: host + '/keys/clear/',
    });
  }
});

function createKey() {
  return (Math.random() * 3000000000).toString().split('.')[0];
}


server.route({
  method: 'POST',
  path: '/clients/login/',
  handler: function(request, reply) {
    var name = request.payload.name || null;
    var passwd = request.payload.passwd || null;

    console.log(request.payload);

    if (!name || !passwd) {
      return reply("Tienes que indicar name y passwd").code(422);
    }

    if (name === 'joe' && passwd === '123123') {
      var key = createKey();
      keys[key] = {name: name, date: new Date()};

      return reply({
        client: {
           key: key,
           expires: "2017-11-12 12:37:45",
           role: "photographer",
           photographer: {
             filename_prefix: "FRU"
           }
        }
      });
    }

    if (name === 'ray' && passwd === '123123') {
      var key = createKey();
      keys[key] = {name: name, date: new Date()};

      return reply({
        client: {
           key: key,
           expires: "2017-11-12 12:37:45",
           role: "tagger"
        }
      });
    }


    reply("datos de acceso incorrectos").code(401);
  },
});




server.route({
  method: 'GET',
  path: '/photos/',
  handler: function(req, reply) {
    reply({photos: db.photos});
  }
});

server.route({
  method: 'GET',
  path: '/events/',
  handler: function(req, reply) {
    if (get_auth_user(req))
      reply({events: db.events});
    else
      reply("Usuario no autenticado").code(402);
  }
});


server.route({
  method: 'GET',
  path: '/keys/',
  handler: function(req, reply) {
    reply({keys: keys});
  }
});

server.route({
  method: 'GET',
  path: '/keys/clear/',
  handler: function(req, reply) {
    reply({status: 'done', removed_keys_count: keys.length});
    keys = {};
  }
});

console.log("Running on http://0.0.0.0:8000")
server.start();
