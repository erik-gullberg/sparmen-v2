'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// The /spex/[id] page is force-static and bakes the full song list (name,
// lyrics, show_warning) into its payload, so every song mutation has to
// invalidate it too. The forms only know about showId/songId, so resolve the
// owning spex here instead of trusting the client to send it.
async function getSpexIdByShow(supabase, showId) {
  if (!showId) return null

  const { data, error } = await supabase
    .from('show')
    .select('spex_id')
    .eq('id', showId)
    .single()

  if (error) {
    console.error('Error resolving spex for show:', error)
    return null
  }

  return data?.spex_id ?? null
}

async function getSpexIdBySong(supabase, songId) {
  if (!songId) return null

  const { data, error } = await supabase
    .from('song')
    .select('show_id')
    .eq('id', songId)
    .single()

  if (error) {
    console.error('Error resolving show for song:', error)
    return null
  }

  return getSpexIdByShow(supabase, data?.show_id)
}

export async function createSpex(formData) {
  const supabase = await createClient()

  const title = formData.get('title')

  const { data, error } = await supabase
    .from('spex')
    .insert([
      {
        name: title,
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

  // The spex page holds the whole song list statically — without this the new
  // song stays invisible there for up to an hour.
  const spexId = await getSpexIdByShow(supabase, showId)
  if (spexId) {
    revalidatePath(`/spex/${spexId}`)
  }

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

  // The spex page renders the lyrics inline, so it goes stale on edits too.
  const spexId = await getSpexIdBySong(supabase, songId)
  if (spexId) {
    revalidatePath(`/spex/${spexId}`)
  }

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

  // show_warning is baked into the spex page's song list as well.
  const spexId = await getSpexIdBySong(supabase, songId)
  if (spexId) {
    revalidatePath(`/spex/${spexId}`)
  }

  return { success: true }
}

export async function deleteSong(formData) {
  const supabase = await createClient()

  const songId = formData.get('songId')
  // Resolve before deleting — afterwards the row is gone and the lookup fails.
  const spexId =
    formData.get('spexId') || (await getSpexIdBySong(supabase, songId))

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

