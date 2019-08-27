CREATE TABLE poste (
    etiqueta char(5),
    material char(1),
    latitude decimal(5,2),
    longitude decimal(5,2),
    primary key (etiqueta)
);

CREATE TABLE inspecao (
    ID serial,
    estado_conservacao boolean,
    prumo boolean,
    condicao_fiacao boolean,
    data date,
    poste_etiqueta char(5),
    primary key (ID)
);

ALTER TABLE inspecao ADD FOREIGN KEY (poste_etiqueta)
    REFERENCES poste (etiqueta);

