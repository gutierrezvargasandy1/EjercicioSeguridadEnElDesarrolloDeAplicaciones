CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    lastname VARCHAR(400)
);

CREATE TABLE tarea (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description VARCHAR(500),
    priority SMALLINT NOT NULL,
    user_id INTEGER REFERENCES usuarios(id)
);


insert into usuarios (name, lastname ) values ('Andy', 'Gutierrez'), ('natalia', 'Vargas');

INSERT INTO tarea (name, description, priority, user_id)
VALUES 
('Hacer reporte', 'Completar el reporte de seguridad', 1, 1),
('Estudiar PostgreSQL', 'Practicar relaciones y llaves foraneas', 2, 2);
