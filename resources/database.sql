CREATE TABLE spex(
    spex_id     DEFAULT lower(hex(randomblob(6))),
    name        TEXT,
    year        INT,
    context     TEXT,
    PRIMARY KEY(spex_id)
)

CREATE TABLE song(
    song_id     DEFAULT lower(hex(randomblob(6))),
    text        TEXT,
    context     TEXT,
    PRIMARY KEY(song_id),
    FOREIGN KEY(spex_id) REFERENCES spex(spex_id)

)

CREATE TABLE retake(
    retake_id   DEFAULT lower(hex(randomblob(6))),
    text        TEXT,
    song        TEXT,
    PRIMARY KEY(retake_id),
    FOREIGN KEY(song_id) REFERENCES song(song_id)
)