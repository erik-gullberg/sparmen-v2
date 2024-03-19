CREATE DATABASE database;
CREATE TABLE spex(
    spex_name   TEXT,
    year        INT,
    context     TEXT,
    PRIMARY KEY(name, year)
)

CREATE TABLE song(
    song_name   TEXT UNIQUE;
    text        TEXT,
    context     TEXT,
    PRIMARY KEY(song_name),
    FOREIGN KEY(spex_id) REFERENCES spex(name, year)

)
CREATE TABLE retake(
    retake_name TEXT UNIQUE;
    text        TEXT,
    song        TEXT,
    PRIMARY KEY(retake_name),
    FOREIGN KEY(song_id) REFERENCES song(song_name)
)