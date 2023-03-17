const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const app = express();
const DB = require("./databases");
const { json } = require("express");

app.use(express.json());
app.use(cors());
app.use(express.static("views"));
var databases = DB.connectionDataBase;

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/api", (req, resp) => {
  var respuesta = {};
  respuesta.mensaje = "petición GET recbido ...";
  resp.json(respuesta);
});

app.get("/menu", (req, res) => {
  res.render("menu");
});

app.get("/CPA", (req, res) => {
  res.render("CPA");
});
app.get("/CVE", (req, res) => {
  res.render("CVE");
});
app.get("/CTPA", (req, res) => {
  res.render("CTPA");
});
app.get("/CMC", (req, res) => {
  res.render("CMC");
});
app.get("/CCM", (req, res) => {
  res.render("CCM");
});
app.get("/CCC", (req, res) => {
  res.render("CCC");
});
app.get("/CES", (req, res) => {
  res.render("CES");
})
app.get("/CAC", (req, res) => {
  res.render("CAC");
})

//motor de plantillas
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use(express.static(__dirname + "/public"));

app.post("/Login", (req, resp) => {
  const reqData = {};
  var Usuario = req.body.Matricula;
  var Contraseña = req.body.Contraseña;
  // console.log(Matricula, Contraseña);

  databases.query(
    "select * from vendedor where Usuario = ? and Contraseña = ?",
    [Usuario, Contraseña],
    (err, rows, fields) => {
      console.log(rows);
      if (!err) {
        /* const hash = crypto.createHash("sha1").update(Contraseña).digest("hex"); */
        if (
          rows.length == 1 &&
          rows[0].Usuario == Usuario &&
          rows[0].Contraseña == Contraseña
        ) {
          const user = rows[0];
          jwt.sign(
            { user: user },
            "accessKey",
            { expiresIn: "1h" },
            (err, token) => {
              resp.json({ token: token });
            }
          );
        } else {
          resp.sendStatus(403);
        }
      } else {
        resp.sendStatus(503);
      }
    }
  );
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  //console.log(req.headers);
  if (typeof bearerHeader !== "undefined") {
    const bearerToken = bearerHeader.split(" ")[1];
    req.token = bearerToken;
    console.log(bearerToken);
    next();
  } else {
    res.sendStatus(403);
  }
}

const port = 3000;
app.listen(port, () => {
  console.log("servidores en el puerto", +port);
});

//consultas

//consulta de informacion alumno
//app.get("/consultaNombre", verifyToken, (request, response) => {

app.get('/productos', (req, res) => {
  databases.query('SELECT * FROM emdst2.producto;', (error, rows, fields) => {
    if (error){
      console.log(error);
    }else{
      res.json(rows);
    }
  })
})

app.get('/productos/:idProducto', (req,res)=>{
  var idProducto=req.params.idProducto;
  databases.query('SELECT * FROM producto where idProducto=?;',[idProducto],(error,rows,fields)=>{
      if(error){
          alert("Error");
      }
      else{
          res.json(rows);
          
      }
  });
});

app.delete("/eliminar/:idProducto", (request, response) => {
  var idProducto= request.params.idProducto;
  var respuesta = {};
  databases.query(
    "delete from producto where idProducto= ?;",[idProducto],
    function (err, rows, fields) {
      if (!err) { 
        respuesta.estado = true;
        respuesta.comentario = "consulta  correcta";
        respuesta.filas = rows.affectedRows;
        response.json(rows);
      } else {
        respuesta.estado = false;
        respuesta.comentario = "Error en consulta ";
        respuesta.error = err;
        response.json(respuesta);
      }
    }
  );
});

app.put('/productos/update', (request,response)=>{
  var idProducto=request.body.idProducto;
  var Nombre=request.body.Nombre;
  var Precio=request.body.Precio;
  console.log(request.body);
  
databases.query('UPDATE producto SET Nombre=?, Precio=? where idProducto = ?;',[Nombre, Precio, idProducto],(error,rows,fields)=>{
      if(error){
          console.log(error);
      }
      else{
          
          response.json(rows);
          console.log(rows);
      }
  });
});

//consulta para alta de productos
app.post('/api/productos', (request,response)=>{
  var idCategoria=request.body.idCategoria;
  var Nombre=request.body.Nombre;
  var Precio=request.body.Precio;
  console.log(request.body);
  
  databases.query('INSERT INTO producto SET idCategoria=?, Nombre=?, Precio=?;',[idCategoria, Nombre, Precio],(error,rows,fields)=>{
      if(error){
          console.log(error);
      }
      else{
          
          response.json(rows);
          console.log(rows);
      }
  });
});

//consulta para alta de usuarios
app.post('/api/usuario', (request,response)=>{
  var idVendedor=request.body.idVendedor;
  var Usuario=request.body.Usuario;
  var Contraseña=request.body.Contraseña;
  console.log(request.body);
  
  databases.query('INSERT INTO vendedor SET idVendedor=?, Usuario=?, Contraseña=?;',[idVendedor, Usuario, Contraseña],(error,rows,fields)=>{
      if(error){
          console.log(error);
      }
      else{
          
          /* response.json(rows); */
          console.log(json);
      }
  });
});
//consulta para mostrar categoria
app.get("/categoria", (req,res) => {
  databases.query('Select * from categoria', (err,rows, fields) => {
      if (!err){
          res.json(rows);
      }
      else{
          console.log('Error al consultar \n' + err.message);
      }
  });
});

app.get("/consultaCategoria/:idCategoria", (request, response) => {
  const idCategoria = request.params.idCategoria;
  var respuesta = {};
  databases.query(
    "SELECT * FROM emdst2.producto where idCategoria  = ? ",
    [idCategoria],
    function (err, rows, fields) {
      if (!err) { 
        respuesta.estado = true;
        respuesta.comentario = "consulta  correcta";
        respuesta.filas = rows.affectedRows;
        response.json(rows);
      } else {
        respuesta.estado = false;
        respuesta.comentario = "Error en consulta ";
        respuesta.error = err;
        response.json(respuesta);
      }
    }
  );
});

app.get("/consultaProducto/:idProducto", (request, response) => {
  const idproducto = request.params.idProducto;
  console.log(idproducto)
  var respuesta = {};
  databases.query(
    "SELECT * FROM emdst2.producto where idProducto  = ? ",
    [idproducto],
    function (err, rows, fields) {
      if (!err) { 
        respuesta.estado = true;
        respuesta.comentario = "consulta  correcta";
        respuesta.filas = rows.affectedRows;
        response.json(rows);
      } else {
        respuesta.estado = false;
        respuesta.comentario = "Error en consulta ";
        respuesta.error = err;
        response.json(respuesta);
      }
    }
  );
});


app.get("/consultaProducto", (request, response) => {
  var respuesta = {};
  databases.query(
    "SELECT * FROM emdst2.producto",
    function (err, rows, fields) {
      if (!err) { 
        respuesta.estado = true;
        respuesta.comentario = "consulta  correcta";
        respuesta.filas = rows.affectedRows;
        response.json(rows);
      } else {
        respuesta.estado = false;
        respuesta.comentario = "Error en consulta ";
        respuesta.error = err;
        response.json(respuesta);
      }
    }
  );
});

app.put('/insertVenta', (req,res)=>{
  var idVenta=req.body.idVenta;
  var nomCliente=req.body.nomCliente; 
  databases.query('insert into Venta (idVenta, Nombre_cliente) values (?,? );',
  [idVenta,nomCliente],
  (error,rows,fields)=>{
      if(error){
          alert("Error");
      }
      else{
          res.json(rows);
          

      }
  });

});


app.put('/insertVentaProducto', (req,res)=>{
  var idVenta=req.body.idVenta;
  var idproducto = req.body.idProducto;
  var cantidad = req.body.Cantidad;
    databases.query('insert into venta_producto (idVenta, idProducto, cantidad) values (?,?,?);',
    [idVenta,idproducto,cantidad],
    (error,rows,fields)=>{
        if(error){
            console.log(error);
        }
        else{
            res.json(rows);
            
  
        }
    });
 
})

app.get("/nventas", (request, response) => {
  var respuesta = {};
  databases.query(
    "select count(idVenta) as numeroVentas from emdst2.venta;",
    function (err, rows, fields) {
      if (!err) { 
        respuesta.estado = true;
        respuesta.comentario = "consulta  correcta";
        respuesta.filas = rows.affectedRows;
        response.json(rows);
      } else {
        respuesta.estado = false;
        respuesta.comentario = "Error en consulta ";
        respuesta.error = err;
        response.json(respuesta);
      }
    }
  );
});



app.get("/mostrarpedidos", (request, response) => {
  var respuesta = {};
  databases.query(
    "SELECT venta.idVenta, venta.Nombre_cliente , count(venta_producto.cantidad) as Cantidad FROM venta INNER JOIN venta_producto ON venta.idVenta = venta_producto.idVenta; ",
    function (err, rows, fields) {
      if (!err) { 
        respuesta.estado = true;
        respuesta.comentario = "consulta  correcta";
        respuesta.filas = rows.affectedRows;
        response.json(rows);
      } else {
        respuesta.estado = false;
        respuesta.comentario = "Error en consulta ";
        respuesta.error = err;
        response.json(respuesta);
      }
    }
  );
});

app.delete("/eliminarProducto1/:idProducto", (request, response) => {
  const idproducto = request.params.idProducto;
  console.log(idproducto)
  var respuesta = {};
  databases.query(
    "delete  from venta_producto where idVenta=?; ",
    [idproducto],
    function (err, rows, fields) {
      if (!err) { 
        respuesta.estado = true;
        respuesta.comentario = "consulta  correcta";
        respuesta.filas = rows.affectedRows;
        response.json(rows);
      } else {
        respuesta.estado = false;
        respuesta.comentario = "Error en consulta ";
        respuesta.error = err;
        response.json(respuesta);
      }
    }
  );
});

app.delete("/eliminarProducto2/:idProducto", (request, response) => {
  const idproducto = request.params.idProducto;
  console.log(idproducto)
  var respuesta = {};
  databases.query(
    "delete  from venta where idVenta=?; ",
    [idproducto],
    function (err, rows, fields) {
      if (!err) { 
        respuesta.estado = true;
        respuesta.comentario = "consulta  correcta";
        respuesta.filas = rows.affectedRows;
        response.json(rows);
      } else {
        respuesta.estado = false;
        respuesta.comentario = "Error en consulta ";
        respuesta.error = err;
        response.json(respuesta);
      }
    }
  );
});