-- Playlist feature migration
-- Run this in your Supabase SQL editor

-- Playlist table
CREATE TABLE IF NOT EXISTS playlist (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Playlist song junction table
CREATE TABLE IF NOT EXISTS playlist_song (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID   NOT NULL REFERENCES playlist(id) ON DELETE CASCADE,
    song_id     BIGINT NOT NULL REFERENCES song(id) ON DELETE CASCADE,
    added_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(playlist_id, song_id)
);

-- RLS: owners can write playlists, everyone can read
ALTER TABLE playlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public playlists are viewable by everyone"
    ON playlist FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own playlists"
    ON playlist FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
    ON playlist FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
    ON playlist FOR DELETE
    USING (auth.uid() = user_id);

-- RLS: playlist_song follows playlist ownership
ALTER TABLE playlist_song ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public playlist songs are viewable by everyone"
    ON playlist_song FOR SELECT
    USING (true);

CREATE POLICY "Users can add songs to their own playlists"
    ON playlist_song FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM playlist
            WHERE playlist.id = playlist_id
              AND playlist.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can remove songs from their own playlists"
    ON playlist_song FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM playlist
            WHERE playlist.id = playlist_id
              AND playlist.user_id = auth.uid()
        )
    );

-- Helpful index
CREATE INDEX IF NOT EXISTS playlist_user_id_idx ON playlist(user_id);
CREATE INDEX IF NOT EXISTS playlist_song_playlist_id_idx ON playlist_song(playlist_id);

