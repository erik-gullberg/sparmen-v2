CREATE TABLE spex(
    spex_name   TEXT,
    year        VARCHAR(255),
    context     TEXT,
    PRIMARY KEY(year)
);
CREATE TABLE songs(
	song_id		INT AUTO_INCREMENT,
    song_name   TEXT,
    text        TEXT,
    context     TEXT,
    year        VARCHAR(255),
    PRIMARY KEY(song_id),
    FOREIGN KEY(year) REFERENCES spex(year)
);
CREATE TABLE retakes(
	retake_id	INT,
    retake_name TEXT,
    text        TEXT,
    song_id   	INT,
    PRIMARY KEY(retake_id),
    FOREIGN KEY(song_id) REFERENCES songs(song_id)
);