const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Ubicacion = require("../models/ubicacionGKN.js");
const Gasto = require("../models/gastos.js"); // corregido

router.get("/gt", async (req, res) => {
  try {
    const gastos = await Gasto.find();
    console.log(gastos);
    res.render("igastos", { gastos });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener gastos");
  }
});

router.post("/add", async (req, res) => {
  try {
    const gasto = new Gasto(req.body);
    await gasto.save();
    res.redirect("/gt");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al agregar gasto");
  }
});

router.post("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Gasto.updateOne({ _id: id }, req.body);
    res.redirect("/gt");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al editar gasto");
  }
});

router.get("/done/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const gasto = await Gasto.findById(id);
    gasto.status = !gasto.status;
    await gasto.save();
    res.redirect("/gt");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cambiar estado");
  }
});

router.get("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const gasto = await Gasto.findById(id);
    res.render("gedit", { gasto });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar edición");
  }
});

router.post("/db/update", async (req, res) => {
  try {
    const gasto = new Gasto(req.body); // corregido
    await gasto.save();
    res.redirect("/gt");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al actualizar base de datos");
  }
});

router.get("/db/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Gasto.deleteOne({ _id: id });
    res.redirect("/gt"); // corregido
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al eliminar gasto");
  }
});

router.post('/subgrupos/eliminar-multiples', async (req, res) => {
  const ids = req.body.subgruposSeleccionados;
  if (!ids || ids.length === 0) {
    return res.redirect('/subgrupos'); // o mostrar un mensaje de error
  }

  try {
    await Subgrupo.deleteMany({ _id: { $in: ids } });
    res.redirect('/subgrupos');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar subgrupos');
  }
});

// Ruta GET para mostrar formulario de conexión
router.get('/', (req, res) => {
  res.render('home'); // Asegúrate de tener views/conexion.ejs
});

// POST /db/submit: conectar a MongoDB y redirigir al formulario de ubicación
router.post('/db/submit', async (req, res) => {
  if (!req.body || !req.body.db1) {
    return res.status(400).json({
      success: false,
      message: 'Datos incompletos',
    });
  }

  const URI = `mongodb+srv://${req.body.db1}:JLqfp91zOg8yjP2A@cluster0.lnpsbzn.mongodb.net/rapqp2?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectTimeoutMS: 10000,
    });

    // Respuesta JSON con instrucción de redirección
    return res.json({ success: true, redirectTo: '/registro-ubicacion' });

  } catch (error) {
    console.error('Error MongoDB:', error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Ruta GET para mostrar el formulario de ubicación
router.get('/registro-ubicacion', (req, res) => {
  res.render('ubicacion'); // Asegúrate de tener views/registro-ubicacion.ejs
});


// Ruta para guardar datos de ubicación
router.post("/registro-ubicacion", async (req, res) => {
  try {
    console.log("Datos de ubicación recibidos:", req.body);

    // Convertir strings a los tipos adecuados
    const nuevaUbicacion = new Ubicacion({
      nombre: req.body.nombre,
      latitud: parseFloat(req.body.latitud),
      longitud: parseFloat(req.body.longitud),
      entrada: req.body.entrada, // asegúrate que venga como "entrada" en el form
      fechaHora: new Date(req.body.fechaHora),
    });

    // Guardar en la base de datos
    const resultado = await nuevaUbicacion.save();
    console.log("Guardado en MongoDB:", resultado);

    res.redirect("/sorpresa"); // o la ruta que desees
  } catch (error) {
    console.error("Error al guardar ubicación:", error);
    res.status(500).send("Error al guardar la ubicación");
  }
});

  router.get('/sorpresa', (req, res) => {
    res.render('sorpresa1');
});

router.get('/ubicaciones', async (req, res) => {
  try {
    const ubicaciones = await Ubicacion.find().sort({ fechaHora: -1 }); // más recientes primero
    res.render('../views/ubicaciones', { ubicaciones });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener ubicaciones');
  }
});

router.delete('/ubicaciones/:id', async (req, res) => {
  try {
    await Ubicacion.findByIdAndDelete(req.params.id);
    res.redirect('/ubicaciones');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al borrar el registro');
  }
});



module.exports = router;
