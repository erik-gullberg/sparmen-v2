'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function getUserPlaylists() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Inte inloggad' }

  const { data, error } = await supabase
    .from('playlist')
    .select('id, name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching playlists:', error)
    return { error: error.message }
  }

  return { data }
}

export async function createPlaylist(formData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Inte inloggad' }

  const name = formData.get('name')
  if (!name?.trim()) return { error: 'Namnet får inte vara tomt' }

  const { data, error } = await supabase
    .from('playlist')
    .insert({ user_id: user.id, name: name.trim() })
    .select()
    .single()

  if (error) {
    console.error('Error creating playlist:', error)
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { data }
}

export async function addSongToPlaylist(playlistId, songId) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Inte inloggad' }

  const { error } = await supabase
    .from('playlist_song')
    .insert({ playlist_id: playlistId, song_id: songId })

  if (error) {
    if (error.code === '23505') return { error: 'Låten finns redan i spellistan' }
    console.error('Error adding song to playlist:', error)
    return { error: error.message }
  }

  revalidatePath(`/playlist/${playlistId}`)
  return { success: true }
}

export async function removeSongFromPlaylist(playlistId, songId) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Inte inloggad' }

  const { error } = await supabase
    .from('playlist_song')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('song_id', songId)

  if (error) {
    console.error('Error removing song from playlist:', error)
    return { error: error.message }
  }

  revalidatePath(`/playlist/${playlistId}`)
  return { success: true }
}

export async function deletePlaylist(playlistId) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Inte inloggad' }

  const { error } = await supabase
    .from('playlist')
    .delete()
    .eq('id', playlistId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting playlist:', error)
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function createPlaylistAndAddSong(name, songId) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Inte inloggad' }

  if (!name?.trim()) return { error: 'Namnet får inte vara tomt' }

  const { data: playlist, error: createError } = await supabase
    .from('playlist')
    .insert({ user_id: user.id, name: name.trim() })
    .select()
    .single()

  if (createError) {
    console.error('Error creating playlist:', createError)
    return { error: createError.message }
  }

  const { error: addError } = await supabase
    .from('playlist_song')
    .insert({ playlist_id: playlist.id, song_id: songId })

  if (addError) {
    console.error('Error adding song to new playlist:', addError)
    return { error: addError.message }
  }

  revalidatePath('/profile')
  revalidatePath(`/playlist/${playlist.id}`)
  return { data: playlist }
}

