import { supabase } from './supabase'
import { TablesInsert, TablesUpdate, Profile } from './database.types'

export interface CreateProfileData {
  walletAddress: string
  fullName: string
  bio?: string
  skills: string[]
  experienceLevel: string
  location?: string
  remotePreference: boolean
  availableStartDate?: string
  email?: string
}

export interface UpdateProfileData extends Partial<CreateProfileData> {
  id: string
}

/**
 * Create a new user profile
 */
export async function createProfile(data: CreateProfileData): Promise<{ profile: Profile | null; error: string | null }> {
  try {
    const profileData: TablesInsert<'profiles'> = {
      wallet_address: data.walletAddress,
      full_name: data.fullName,
      bio: data.bio || null,
      skills: data.skills,
      experience_level: data.experienceLevel,
      location: data.location || null,
      remote_preference: data.remotePreference,
      available_start_date: data.availableStartDate || null,
      email: data.email || null,
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      return { profile: null, error: error.message }
    }

    return { profile, error: null }
  } catch (error) {
    console.error('Unexpected error creating profile:', error)
    return { profile: null, error: 'An unexpected error occurred' }
  }
}

/**
 * Update an existing user profile
 */
export async function updateProfile(data: UpdateProfileData): Promise<{ profile: Profile | null; error: string | null }> {
  try {
    const updateData: TablesUpdate<'profiles'> = {
      wallet_address: data.walletAddress,
      full_name: data.fullName,
      bio: data.bio,
      skills: data.skills,
      experience_level: data.experienceLevel,
      location: data.location,
      remote_preference: data.remotePreference,
      available_start_date: data.availableStartDate,
      email: data.email,
      updated_at: new Date().toISOString(),
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof TablesUpdate<'profiles'>] === undefined) {
        delete updateData[key as keyof TablesUpdate<'profiles'>]
      }
    })

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return { profile: null, error: error.message }
    }

    return { profile, error: null }
  } catch (error) {
    console.error('Unexpected error updating profile:', error)
    return { profile: null, error: 'An unexpected error occurred' }
  }
}

/**
 * Get a profile by wallet address
 */
export async function getProfileByWallet(walletAddress: string): Promise<{ profile: Profile | null; error: string | null }> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error fetching profile:', error)
      return { profile: null, error: error.message }
    }

    return { profile: profile || null, error: null }
  } catch (error) {
    console.error('Unexpected error fetching profile:', error)
    return { profile: null, error: 'An unexpected error occurred' }
  }
}

/**
 * Get a profile by ID
 */
export async function getProfileById(id: string): Promise<{ profile: Profile | null; error: string | null }> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error fetching profile:', error)
      return { profile: null, error: error.message }
    }

    return { profile: profile || null, error: null }
  } catch (error) {
    console.error('Unexpected error fetching profile:', error)
    return { profile: null, error: 'An unexpected error occurred' }
  }
}

/**
 * Check if a profile exists for a wallet address
 */
export async function profileExists(walletAddress: string): Promise<{ exists: boolean; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking profile existence:', error)
      return { exists: false, error: error.message }
    }

    return { exists: !!data, error: null }
  } catch (error) {
    console.error('Unexpected error checking profile existence:', error)
    return { exists: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Delete a profile
 */
export async function deleteProfile(id: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting profile:', error)
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error deleting profile:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Search profiles by skills
 */
export async function searchProfilesBySkills(skills: string[]): Promise<{ profiles: Profile[]; error: string | null }> {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .overlaps('skills', skills)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching profiles:', error)
      return { profiles: [], error: error.message }
    }

    return { profiles: profiles || [], error: null }
  } catch (error) {
    console.error('Unexpected error searching profiles:', error)
    return { profiles: [], error: 'An unexpected error occurred' }
  }
}
