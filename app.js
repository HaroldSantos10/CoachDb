const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const NodeCouchDb = require('node-couchdb');

//datos de autencicación 

const couch = new NodeCouchDb({
    auth: {
        user:'admin',
        pass:'admin1234'
    }
});

//mostrar elementos de la vista en una lista

//nombre de la base de datos y url de la view
const dbName = 'libros';
const viewUrl = "_design/all_libros/_view/all";




//listar los documentos de la bd READ

couch.listDatabases().then(function(dbs){
    console.log(dbs);
});





const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


//READ llama los documents
app.get('/', function(req, res){
    couch.get(dbName, viewUrl).then(
        function(data, headers, status){
            console.log(data.data.rows);
            res.render('index',{
                libros:data.data.rows
            });
        },
        function(err){
            res.send(err);
        }
    );
    //res.render('index');
});


//guarda nuevos libros POST

app.post('/libro/add', function(req, res){
    const nombre_libro = req.body.nombre_libro;
    const autor = req.body.autor;
    const pais = req.body.pais;
    
    couch.uniqid().then(function(ids){

        const id = ids[0];
        
        couch.insert('libros', {
            _id: id,
            nombre_libro: nombre_libro,
            autor: autor,
            pais: pais
        }).then(
            function(data, headers, status){
                res.redirect('/');
            },
            function(err){
                res.send(err);
            }
        );


    });


});


//Eliminar un document  DELETE

app.post('/libro/delete/:id', function(req, res){
    const id = req.params.id;
    const rev = req.body.rev;

    couch.del(dbName, id, rev).then(
        function(data, headers, status){
            res.redirect('/')

        },
        function(err){
            res.send(err);
        }
    );

});





//puerto donde corre el servidor 
app.listen(3000, function(){
    console.log('Server Standard On Port 3000')
});

