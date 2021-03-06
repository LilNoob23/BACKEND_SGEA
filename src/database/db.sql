/*MAKING THE DATABASE*/
CREATE DATABASE ihc_database;

/*CREATING TABLE EVENTOS*/
DROP TABLE IF EXISTS EVENTOS;

CREATE TABLE EVENTOS (
    id INT NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(100) NOT NULL,
    tipo_coordinador TINYINT(1) NOT NULL,
    nombre_coordinador VARCHAR(50) NOT NULL,
    id_coordinador INT NOT NULL,
    tipo_evento VARCHAR(4) NOT NULL,
    fecha_inicio DATE NOT NULL, 
    fecha_fin DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    duracion TINYINT(2) NOT NULL,
    tipo_inscripcion TINYINT(1) NOT NULL,
    precio_inscripcion SMALLINT(4) NULL,
    descripcion VARCHAR(255)NOT NULL,
    tipo_certificado TINYINT(1) NOT NULL,
    precio_certificado SMALLINT(4) NULL,
    tipo_ambiente VARCHAR(4) NOT NULL,
    participantes SMALLINT(3) NOT NULL,
    logo VARCHAR(30) NOT NULL,
    img1 VARCHAR(30) NOT NULL,
    img2 VARCHAR(30) NOT NULL,
    img3 VARCHAR(30) NOT NULL,
    PRIMARY KEY(id),
    KEY fk_coordinador_id (id_coordinador),
    KEY fk_tipo_coordinador_id (tipo_coordinador),
    KEY fk_tipo_evento_id (tipo_evento),
    KEY fk_tipo_inscripcion_id (tipo_inscripcion),
    KEY fk_tipo_certificado_id (tipo_certificado),
    KEY fk_tipo_ambiente_id (tipo_ambiente),
    CONSTRAINT fk_id_coordinador FOREIGN KEY(id_coordinador) REFERENCES USUARIOS(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tipo_coordinador FOREIGN KEY(tipo_coordinador) REFERENCES TIPOS_COORDINADOR(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tipo_evento FOREIGN KEY(tipo_evento) REFERENCES TIPOS_EVENTO(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tipo_inscripcion FOREIGN KEY(tipo_inscripcion) REFERENCES TIPOS_INSCRIPCION(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tipo_certificado FOREIGN KEY(tipo_certificado) REFERENCES TIPOS_CERTIFICADOS(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_tipo_ambiente FOREIGN KEY(tipo_ambiente) REFERENCES TIPOS_AMBIENTE(id) ON DELETE CASCADE ON UPDATE CASCADE
);

/*CREATING THE TABLE USUARIOS*/
DROP TABLE IF EXISTS USUARIOS;

CREATE TABLE USUARIOS (
    id INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL, 
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    edad TINYINT(3),
    celular INT(9) UNIQUE,
    sexo VARCHAR(9),
    ocupacion VARCHAR(30),
    tipo_usuario VARCHAR(1) NOT NULL DEFAULT 'N',
    foto VARCHAR(30),
    PRIMARY KEY(id)
);

/*CREATING THE TABLE INSCRIPCIONES*/
DROP TABLE IF EXISTS INSCRIPCIONES;

CREATE TABLE INSCRIPCIONES (
    id_evento INT NOT NULL,
    id_usuario INT NOT NULL,
    certificado TINYINT(1) NOT NULL,
    voucher VARCHAR(30) NOT NULL,
    fecha_inscripcion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY fk_evento_id (id_evento),
    KEY fk_usuario_id (id_usuario),
    CONSTRAINT fk_evento FOREIGN KEY(id_evento) REFERENCES EVENTOS(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_usuario FOREIGN KEY(id_usuario) REFERENCES USUARIOS(id) ON DELETE CASCADE ON UPDATE CASCADE
);

/*CREATING THE TABLE SOLICITUDES*/
DROP TABLE IF EXISTS SOLICITUDES;

CREATE TABLE SOLICITUDES (
    id int NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    estado TINYINT(1) NOT NULL,
    id_evento INT NOT NULL,
    fecha_envio TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    observaciones VARCHAR(255) NULL,
    PRIMARY KEY(id),
    KEY fk_estado_id (estado),
    KEY fk_evento_id (id_evento),
    CONSTRAINT fk_estado FOREIGN KEY(estado) REFERENCES TIPOS_ESTADO(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_evento FOREIGN KEY(id_evento) REFERENCES EVENTOS(id) ON DELETE CASCADE ON UPDATE CASCADE
);

/*CREATING THE TABLE TIPOS_ESTADO*/
DROP TABLE IF EXISTS TIPOS_ESTADO;

CREATE TABLE TIPOS_ESTADO (
    id INT NOT NULL AUTO_INCREMENT,
    descripcion VARCHAR(9) NOT NULL,
    PRIMARY KEY(id)
);

/*CREATING THE TABLE TIPOS_COORDINADOR*/
DROP TABLE IF EXISTS TIPOS_COORDINADOR;

CREATE TABLE TIPOS_COORDINADOR (
    id TINYINT(1) NOT NULL AUTO_INCREMENT,
    descripcion VARCHAR(9) NOT NULL,
    PRIMARY KEY(id)
);

/*CREATING THE TABLE TIPOS_EVENTO*/
DROP TABLE IF EXISTS TIPOS_EVENTO;

CREATE TABLE TIPOS_EVENTO (
    id VARCHAR(4) NOT NULL ,
    descripcion VARCHAR(10) NOT NULL,
    PRIMARY KEY(id)
);

/*CREATING THE TABLE TIPOS_INSCRIPCION*/
DROP TABLE IF EXISTS TIPOS_INSCRIPCION;

CREATE TABLE TIPOS_INSCRIPCION (
    id TINYINT(1) NOT NULL AUTO_INCREMENT,
    descripcion VARCHAR(8) NOT NULL,
    PRIMARY KEY(id)
);

/*CREATING THE TABLE TIPOS_CERTIFICADO*/
DROP TABLE IF EXISTS TIPOS_CERTIFICADO;

CREATE TABLE TIPOS_CERTIFICADO (
    id TINYINT(1) NOT NULL AUTO_INCREMENT,
    descripcion VARCHAR(9) NOT NULL,
    PRIMARY KEY(id)
);

/*CREATING THE TABLE TIPOS_AMBIENTE*/
DROP TABLE IF EXISTS TIPOS_AMBIENTE;

CREATE TABLE TIPOS_AMBIENTE (
    id VARCHAR(4) NOT NULL,
    descripcion VARCHAR(10) NOT NULL,
    PRIMARY KEY(id)
);