'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function createSpex(formData) {
  const supabase = await createClient()

  const title = formData.get('title')
  const year = formData.get('year')
  const name = formData.get('name')

  // Support both 'name' and 'title'+'year' formats
  const spexName = name || `${title} (${year})`

  const { data, error } = await supabase
    .from('spex')
    .insert([
      {
        name: spexName,
        year: year ? parseInt(year) : null
      }
    ])
    .select()

  if (error) {
    console.error('Error creating spex:', error)
    return { error: error.message }
  }

  // Revalidate all pages that show spex lists
  revalidatePath('/')
  revalidatePath('/search')

  return { data: data[0] }
}

export async function createShow(formData) {
  const supabase = await createClient()

  const spexId = formData.get('spexId')
  const year = formData.get('year')

  const { data, error } = await supabase
    .from('show')
    .insert([
      {
        spex_id: spexId,
        year: year,
        year_short: year,
      }
    ])
    .select()

  if (error) {
    console.error('Error creating show:', error)
    return { error: error.message }
  }

  // Revalidate the spex detail page and home
  revalidatePath('/')
  revalidatePath(`/spex/${spexId}`)

  return { data: data[0], spexId }
}

export async function createSong(formData) {
  const supabase = await createClient()

  const showId = formData.get('showId')
  const name = formData.get('name')
  const lyrics = formData.get('lyrics')
  const melody = formData.get('melody')
  const melodyLink = formData.get('melodyLink')
  const createdBy = formData.get('createdBy')

  const { data, error } = await supabase
    .from('song')
    .insert([
      {
        show_id: showId,
        name: name,
        lyrics: lyrics,
        melody: melody,
        melody_link: melodyLink,
        created_by: createdBy,
      }
    ])
    .select()

  if (error) {
    console.error('Error creating song:', error)
    return { error: error.message }
  }

  // Revalidate all pages that show songs
  revalidatePath('/')
  revalidatePath('/search')
  revalidatePath('/top-songs')

  return { data: data[0] }
}

export async function updateSong(formData) {
  const supabase = await createClient()

  const songId = formData.get('songId')
  const name = formData.get('name')
  const lyrics = formData.get('lyrics')
  const melody = formData.get('melody')
  const melodyLink = formData.get('melodyLink')

  const { data, error } = await supabase
    .from('song')
    .update({
      name: name,
      lyrics: lyrics,
      melody: melody,
      melody_link: melodyLink,
    })
    .eq('id', songId)

  if (error) {
    console.error('Error updating song:', error)
    return { error: error.message }
  }

  // Revalidate the song page and related pages
  revalidatePath('/')
  revalidatePath(`/song/${songId}`)
  revalidatePath('/search')
  revalidatePath('/top-songs')

  return { success: true }
}

export async function voteSong(formData) {
  const supabase = await createClient()

  const songId = formData.get('songId')
  const userId = formData.get('userId')

  const { error } = await supabase.from('vote').insert({
    song_id: songId,
    user_id: userId,
  })

  if (error) {
    console.error('Error voting:', error)
    return { error: error.message }
  }

  // Revalidate pages that show vote counts
  revalidatePath(`/song/${songId}`)
  revalidatePath('/top-songs')
  revalidatePath('/profile')

  return { success: true }
}

export async function unvoteSong(formData) {
  const supabase = await createClient()

  const songId = formData.get('songId')
  const userId = formData.get('userId')

  const { error } = await supabase
    .from('vote')
    .delete()
    .eq('song_id', songId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error unvoting:', error)
    return { error: error.message }
  }

  // Revalidate pages that show vote counts
  revalidatePath(`/song/${songId}`)
  revalidatePath('/top-songs')
  revalidatePath('/profile')

  return { success: true }
}

export async function toggleSongWarning(formData) {
  const supabase = await createClient()

  const songId = formData.get('songId')
  const showWarning = formData.get('showWarning') === 'true'

  const { error } = await supabase
    .from('song')
    .update({ show_warning: !showWarning })
    .eq('id', songId)

  if (error) {
    console.error('Error toggling warning:', error)
    return { error: error.message }
  }

  // Revalidate the song page
  revalidatePath(`/song/${songId}`)

  return { success: true }
}

export async function deleteSong(formData) {
  const supabase = await createClient()

  const songId = formData.get('songId')
  const spexId = formData.get('spexId')

  const { error } = await supabase.from('song').delete().eq('id', songId)

  if (error) {
    console.error('Error deleting song:', error)
    return { error: error.message }
  }

  // Revalidate all pages that might show this song
  revalidatePath('/')
  revalidatePath('/search')
  revalidatePath('/top-songs')
  if (spexId) {
    revalidatePath(`/spex/${spexId}`)
  }

  return { success: true }
}

