const { isLoggedIn, completeUserData } = require("../middlewares/helpers");
const db = require("../../database");
const { Router } = require("express");

//INITIALIZATION
const router = Router();

//ESTA ES LA PÁGINA PRINCIPAL DEL DASHBOARD
router.get("/profile", isLoggedIn, (req, res) => {
  return res
    .status(200)
    .json({ message: "Welcome to your Dashboard", data: req.user });
});

//ESTA ES LA RUTA DEL DASHBOARD PARA ACTUALIZAR LOS DATOS DEL USUARIO
router.put("/profile/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { nombre, apellidos, email, edad, celular, sexo, ocupacion, foto } =
    req.body;

  const newUser = {
    nombre,
    apellidos,
    email,
    edad,
    celular,
    sexo,
    ocupacion,
    foto,
  };

  await db.query("UPDATE usuarios SET ? WHERE id = ?", [newUser, id]);

  return res.json({ status: 200 });
});

//ESTA ES LA RUTA PARA VER LOS EVENTO DISPONIBLES
router.get("/events", isLoggedIn, async (req, res) => {
  const query1 =
    "SELECT e.id, e.titulo,e.logo, DATE_FORMAT(e.fecha_inicio, '%W, %d de %M del %m') AS fecha_inicio, DATE_FORMAT(e.hora_inicio, '%h %p') AS hora_inicio, e.precio_inscripcion FROM eventos AS e JOIN solicitudes AS s ON s.id_evento = e.id WHERE s.estado = 1 GROUP BY participantes";

  const query2 =
    "SELECT e.id, e.titulo,e.logo,DATE_FORMAT(e.fecha_inicio, '%W, %d de %M del %m') AS fecha_inicio, DATE_FORMAT(e.hora_inicio, '%h: %p') AS hora_inicio, e.precio_inscripcion FROM eventos AS e JOIN solicitudes AS s ON s.id_evento = e.id WHERE fecha_inicio > NOW() AND s.estado = 1 GROUP BY fecha_inicio";

  const features = await db.query(query1);

  const closeOnes = await db.query(query2);

  if (features.length > 0 && closeOnes.length > 0) {
    res
      .status(200)
      .json({ featured_events: features, nearby_events: closeOnes });
  } else {
    res.status(400).json({ message: "No found events" });
  }
});

//ESTA RUTA MUESTRA LOS DETALLES DEL EVENTO SELECCIONADO
router.get("/events/details/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;

  const query =
    "SELECT e.logo AS logo_evento, e.titulo, tco.descripcion AS tipo_coordinador, e.nombre_coordinador, DATE_FORMAT(e.fecha_inicio, '%d/%m/%Y') AS fecha_inicio, DATE_FORMAT(e.hora_inicio, '%h %p') AS hora_inicio, e.participantes, ti.descripcion AS tipo_inscripcion, e.precio_inscripcion, tc.descripcion AS tipo_certificado, e.precio_certificado, e.descripcion AS descripcion_evento, u.foto AS foto_coordinador, e.nombre_coordinador FROM eventos AS e JOIN usuarios AS u ON e.id_coordinador = u.id JOIN tipos_coordinador AS tco ON tco.id = e.tipo_coordinador JOIN tipos_inscripcion AS ti  ON ti.id = e.tipo_inscripcion JOIN tipos_certificado AS tc ON tc.id = e.tipo_certificado WHERE e.id = ?";

  const rows = await db.query(query, [id]);

  if (rows.length > 0) {
    res.status(200).json({ data: rows });
  } else {
    res.status(400).json({ data: null, message: "Not found events" });
  }
});

//ESTA RUTA MUESTRA LOS DATOS PREDETERMINADOS EN LA VENTANA DE INSCRIPCION DE UN EVENTO
router.get(
  "events/inscription/:id",
  isLoggedIn,
  completeUserData,
  async (req, res) => {
    const Userdata = await db.query(
      "SELECT nombre, apellidos, edad, celular, sexo, ocupacion FROM usuarios WHERE id = ? ",
      [req.user.id]
    );

    const query =
      "SELECT ti.descripcion, tc.descripcion FROM eventos AS e JOIN tipos_certificado AS tc ON tc.id = e.tipo_certificado JOIN tipos_inscripcion AS ti ON ti.id = e.tipo_inscripcion WHERE e.id = ?";

    const Eventdata = await db.query(query, [id]);

    res.status(200).json({ EventData, Userdata });
  }
);

//ESTA RUTA ES PARA INSCRIBIRSE EN UN EVENTO
router.post(
  "/events/inscription/:id",
  isLoggedIn,
  completeUserData,
  async (req, res) => {
    const { id } = req.params;

    const { certificado, voucher } = req.body;

    const inscription = {
      id_evento: id,
      id_usuario: req.user.id,
      certificado,
      voucher,
    };

    const query = "INSERT INTO inscripciones SET ?";
    await db.query(query, [inscription]);
    res.status(200).json({ message: "Inscription Registered to this event" });
  }
);

//ESTA RUTA MUESTRA LOS EVENTOS SEGUN EL TITULO
// router.get("/events/title/:titulo", isLoggedIn, async (req, res) => {
//   const { titulo } = req.params;

//   const query =
//     "SELECT id, titulo, DATE_FORMAT(fecha_inicio, '%W, %d de %M del %m') AS fecha_inicio, DATE_FORMAT(hora_inicio, '%h %p') AS hora_inicio, precio_inscripcion FROM eventos WHERE titulo = ?";

//   const rows = await db.query(query, [titulo]);

//   if (rows.length > 0) {
//     res.status(200).json({ data: rows });
//   } else {
//     res.status(400).json({ message: "Not found events with this title" });
//   }
// });

//ESTA RUTA MUESTRA LOS EVENTOS SEGUN EL PRECIO
// router.get("/events/prices/:precio1/:precio2", isLoggedIn, async (req, res) => {
//   const { precio1, precio2 } = req.params;

//   const query =
//     "SELECT id, titulo, DATE_FORMAT(fecha_inicio, '%W, %d de %M del %m') AS fecha_inicio, DATE_FORMAT(hora_inicio, '%h %p') AS hora_inicio, precio_inscripcion FROM eventos WHERE precio_inscripcion BETWEEN ? AND ?";

//   const rows = await db.query(query, [precio1, precio2]);

//   if (rows.length > 0) {
//     res.status(200).json({ result: rows });
//   } else {
//     res.status(400).json({ message: "Not found events in this price range" });
//   }
// });

//ESTA RUTA MUESTRA LOS EVENTOS SEGUN LA CATEGORIA
// router.get("/events/category/:categoria", isLoggedIn, async (req, res) => {
//   const { categoria } = req.params;

//   const query =
//     "SELECT e.id, e.titulo, DATE_FORMAT(e.fecha_inicio, '%W, %d de %M del %m') AS fecha_inicio, DATE_FORMAT(e.hora_inicio, '%h %p') AS hora_inicio, e.precio_inscripcion FROM eventos AS e JOIN tipos_evento AS te ON e.tipo_evento = te.id WHERE te.id = ?";

//   const rows = await db.query(query, [categoria]);

//   if (rows.length > 0) {
//     res.status(200).json({ result: rows });
//   } else {
//     res.status(400).json({ message: "Not found events in this category" });
//   }
// });

//ESTA RUTA MUESTRA LOS EVENTOS SEGUN LA FECHA
// router.get("/events/dates/:fecha1/:fecha2", isLoggedIn, async (req, res) => {
//   const { fecha1, fecha2 } = req.params;

//   const query =
//     "SELECT id, titulo, DATE_FORMAT(fecha_inicio, '%W, %d de %M del %m') AS fecha_inicio, DATE_FORMAT(hora_inicio, '%h %p') AS hora_inicio, precio_inscripcion FROM eventos WHERE fecha_inicio BETWEEN cast(? AS date) AND cast(? as date) GROUP BY fecha_inicio";

//   const rows = await db.query(query, [fecha1, fecha2]);

//   if (rows.length > 0) {
//     res.status(200).json({ result: rows });
//   } else {
//     res.status(400).json({ message: "Not found events in this date range" });
//   }
// });

//ESTA ES LA RUTA QUE MUESTRA MIS EVENTOS A LOS QUE ME INSCRIBI
router.get("/myevents", isLoggedIn, async (req, res) => {
  const { id } = req.user;

  const query =
    "SELECT e.id, e.titulo, DATE_FORMAT(e.fecha_inicio, '%W, %d de %M del %m') AS fecha_inicio, DATE_FORMAT(e.hora_inicio, '%h %p') AS hora_inicio, e.precio_inscripcion FROM eventos AS e JOIN inscripciones AS i ON i.id_evento = e.id JOIN usuarios AS u ON i.id_usuario = u.id WHERE e.fecha_inicio > NOW() AND u.id = ?";

  const closeOnes = await db.query(query, [id]);

  if (closeOnes.length > 0) {
    res.status(200).json({ nearby_events: closeOnes });
  } else {
    res.status(400).json({ message: "No found events" });
  }
});

//ESTA ES LA RUTA QUE MUESTRA LOS DETALLES DE MIS EVENTOS A LOS QUE ME INSCRIBI
router.get("/myevents/details/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;

  const query =
    "SELECT e.logo AS logo_evento, e.titulo, tco.descripcion AS tipo_coordinador, e.nombre_coordinador, DATE_FORMAT(e.fecha_inicio, '%d/%m/%Y') AS fecha_inicio, DATE_FORMAT(e.hora_inicio, '%h:%m %p') AS hora_inicio, e.participantes, ti.descripcion AS tipo_inscripcion, e.precio_inscripcion, tc.descripcion AS tipo_certificado, e.precio_certificado, e.descripcion AS descripcion_evento, u.foto AS foto_coordinador, e.nombre_coordinador FROM eventos AS e JOIN usuarios AS u ON e.id_coordinador = u.id JOIN tipos_coordinador AS tco ON tco.id = e.tipo_coordinador JOIN tipos_inscripcion AS ti  ON ti.id = e.tipo_inscripcion JOIN tipos_certificado AS tc ON tc.id = e.tipo_certificado WHERE e.id = ?";

  const rows = await db.query(query, [id, req.user.id]);

  if (rows.length > 0) {
    res.status(200).json({ request: rows });
  } else {
    res.status(400).json({ data: null, message: "Not found requests" });
  }
});

router.get("/myevents/title/:titulo", isLoggedIn, async (req, res) => {
  const { titulo } = req.params;

  const query =
    "SELECT e.id, e.titulo, DATE_FORMAT(e.fecha_inicio, '%W, %d de %M del %m') AS fecha_inicio, DATE_FORMAT(e.hora_inicio, '%h %p') AS hora_inicio, e.precio_inscripcion FROM eventos AS e JOIN inscripciones AS i ON i.id_evento = e.id JOIN usuarios AS u ON i.id_usuario = u.id WHERE e.fecha_inicio > NOW() AND u.id = ? AND e.titulo = ?";

  const rows = await db.query(query, [req.user.id, titulo]);

  if (rows.length > 0) {
    res.status(200).json({ data: rows });
  } else {
    res.status(400).json({ message: "Not found events with this title" });
  }
});

//ESTA RUTA MUESTRA LOS EVENTOS SEGUN EL PRECIO
// router.get(
//   "/myevents/prices/:precio1/:precio2",
//   isLoggedIn,
//   async (req, res) => {
//     const { precio1, precio2 } = req.params;

//     const query =
//       "SELECT e.id, e.titulo, DATE_FORMAT(e.fecha_inicio, '%W, %d de %M del %m') AS fecha_inicio, DATE_FORMAT(e.hora_inicio, '%h %p') AS hora_inicio, e.precio_inscripcion FROM eventos AS e JOIN inscripciones AS i ON i.id_evento = e.id JOIN usuarios AS u ON i.id_usuario = u.id WHERE e.fecha_inicio > NOW() AND u.id = ? AND e.precio_inscripcion BETWEEN ? AND ?";

//     const rows = await db.query(query, [req.user.id, precio1, precio2]);

//     if (rows.length > 0) {
//       res.status(200).json({ result: rows });
//     } else {
//       res.status(400).json({ message: "Not found events in this price range" });
//     }
//   }
// );

//ESTA RUTA MUESTRA LOS EVENTOS SEGUN LA CATEGORIA
// router.get("/myevents/category/:categoria", isLoggedIn, async (req, res) => {
//   const { categoria } = req.params;

//   const query =
//     "SELECT e.id, e.titulo, DATE_FORMAT(e.fecha_inicio, '%W, %d de %M del %m') AS fecha_inicio, DATE_FORMAT(e.hora_inicio, '%h %p') AS hora_inicio, e.precio_inscripcion FROM eventos AS e JOIN inscripciones AS i ON i.id_evento = e.id JOIN usuarios AS u ON i.id_usuario = u.id JOIN tipos_evento AS te ON e.tipo_evento = te.id WHERE e.fecha_inicio > NOW() AND u.id = ? AND te.id = ?";

//   const rows = await db.query(query, [req.user.id, categoria]);

//   if (rows.length > 0) {
//     res.status(200).json({ result: rows });
//   } else {
//     res.status(400).json({ message: "Not found events in this category" });
//   }
// });

//ESTA RUTA MUESTRA LOS EVENTOS SEGUN LA FECHA
// router.get("/myevents/dates/:fecha1/:fecha2", isLoggedIn, async (req, res) => {
//   const { fecha1, fecha2 } = req.params;

//   const query =
//     "SELECT e.id, e.titulo, DATE_FORMAT(e.fecha_inicio, '%W, %d de %M del %m') AS fecha_inicio, DATE_FORMAT(e.hora_inicio, '%h %p') AS hora_inicio, e.precio_inscripcion FROM eventos AS e JOIN inscripciones AS i ON i.id_evento = e.id JOIN usuarios AS u ON i.id_usuario = u.id WHERE fecha_inicio > NOW() AND u.id = ? AND e.fecha_inicio cast(? AS date) AND cast(? as date) GROUP BY fecha_inicio";

//   const rows = await db.query(query, [req.user.id, fecha1, fecha2]);

//   if (rows.length > 0) {
//     res.status(200).json({ result: rows });
//   } else {
//     res.status(400).json({ message: "Not found events in this date range" });
//   }
// });

//ESTA RUTA ES PARA REGISTRAR UN EVENTO
router.post("/events/register", isLoggedIn, async (req, res) => {
  const id_coordinador = req.user.id;

  const {
    titulo,
    tipo_coordinador,
    nombre_coordinador,
    tipo_evento,
    fecha_inicio,
    fecha_fin,
    hora_inicio,
    duracion,
    tipo_inscripcion,
    precio_inscripcion,
    descripcion,
    tipo_certificado,
    precio_certificado,
    tipo_ambiente,
    participantes,
    logo,
  } = req.body;

  const newEvent = {
    titulo,
    tipo_coordinador,
    nombre_coordinador,
    id_coordinador,
    tipo_evento,
    fecha_inicio,
    fecha_fin,
    hora_inicio,
    duracion,
    tipo_inscripcion,
    precio_inscripcion,
    descripcion,
    tipo_certificado,
    precio_certificado,
    tipo_ambiente,
    participantes,
    logo,
  };

  const result = await db.query("INSERT INTO eventos SET ?", [newEvent]);

  const codigoRequest = "FISI2021" + result.insertId;

  const newRequest = {
    codigo: codigoRequest,
    estado: 2,
    id_evento: result.insertId,
  };

  await db.query("INSERT INTO solicitudes SET ?", [newRequest]);

  res.status(200).json({ message: "Event Registered and Request Created" });
});

//ESTA ES LA RUTA DONDE VEO MIS SOLICITUDES
router.get("/myrequests", isLoggedIn, async (req, res) => {
  const { id } = req.user;

  const query =
    "SELECT s.id, s.codigo, e.titulo, DATE_FORMAT(s.fecha_envio, '%d/%m/%Y') AS fecha_envio , s.estado,e.logo FROM solicitudes AS s JOIN eventos AS e ON s.id_evento = e.id JOIN usuarios AS u ON e.id_coordinador = u.id WHERE u.id = ?";

  const rows = await db.query(query, [id]);

  if (rows.length > 0) {
    res.status(200).json({ data: rows });
  } else {
    res.status(400).json({ message: "Not found requests" });
  }
});

//ESTA RUTA MUESTRA LOS DETALLES DE LA SOLICITUD SELECCIONADA
router.get("/myrequests/details/:id", isLoggedIn, async (req, res) => {
  const { id } = req.params;

  const query =
    "SELECT s.codigo, DATE_FORMAT(s.fecha_envio,'%d/%m/%y') AS fecha_envio, e.titulo, tco.descripcion AS tipo_coordinador, e.nombre_coordinador, DATE_FORMAT(e.hora_inicio, '%h:%m %p') AS hora_inicio, DATE_FORMAT(e.fecha_inicio,'%d/%m/%y') AS fecha_inicio, DATE_FORMAT(e.fecha_fin,'%d/%m/%y') AS fecha_fin, te.descripcion AS tipo_evento, e.descripcion, ti.descripcion AS tipo_inscripcion, tc.descripcion AS tipo_certificado, ta.descripcion AS tipo_ambiente, e.participantes, e.duracion , e.logo, s.observaciones FROM eventos AS e JOIN solicitudes AS s ON e.id = s.id_evento JOIN tipos_coordinador AS tco ON tco.id = e.tipo_coordinador JOIN tipos_evento AS te ON te.id = e.tipo_evento JOIN tipos_inscripcion AS ti ON ti.id = e.tipo_inscripcion JOIN tipos_certificado AS tc ON tc.id = e.tipo_certificado JOIN tipos_ambiente AS ta ON ta.id = e.tipo_ambiente WHERE s.id = ?";

  const rows = await db.query(query, [id]);

  if (rows.length > 0) {
    res.status(200).json({ data: rows });
  } else {
    res.status(400).json({ message: "Not found requests" });
  }
});

//EXPORTING DASHBOARD ROUTES
module.exports = router;
