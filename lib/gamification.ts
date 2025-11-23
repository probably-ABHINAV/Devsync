import { getServiceSupabase } from './supabase'

// XP rewards for different actions
export const XP_REWARDS = {
  PR_OPENED: 10,
  PR_MERGED: 25,
  PR_REVIEWED: 5,
  ISSUE_CREATED: 5,
  ISSUE_CLOSED: 10,
  COMMIT: 2,
}

// Level calculation based on XP
export function calculateLevel(xp: number): number {
  // Level up every 100 XP (adjust as needed)
  return Math.floor(xp / 100) + 1
}

export async function awardXP(
  userId: string,
  action: keyof typeof XP_REWARDS
): Promise<void> {
  const supabase = getServiceSupabase()
  const xpAmount = XP_REWARDS[action]

  // Get current stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!stats) {
    // Create initial stats
    await supabase.from('user_stats').insert({
      user_id: userId,
      xp: xpAmount,
      level: calculateLevel(xpAmount),
      prs_opened: action === 'PR_OPENED' ? 1 : 0,
      prs_merged: action === 'PR_MERGED' ? 1 : 0,
      prs_reviewed: action === 'PR_REVIEWED' ? 1 : 0,
      issues_created: action === 'ISSUE_CREATED' ? 1 : 0,
      issues_closed: action === 'ISSUE_CLOSED' ? 1 : 0,
      commits_count: action === 'COMMIT' ? 1 : 0,
    })
  } else {
    // Update stats
    const newXP = stats.xp + xpAmount
    const newLevel = calculateLevel(newXP)

    const updates: any = {
      xp: newXP,
      level: newLevel,
    }

    // Increment action counters
    if (action === 'PR_OPENED') updates.prs_opened = stats.prs_opened + 1
    if (action === 'PR_MERGED') updates.prs_merged = stats.prs_merged + 1
    if (action === 'PR_REVIEWED') updates.prs_reviewed = stats.prs_reviewed + 1
    if (action === 'ISSUE_CREATED') updates.issues_created = stats.issues_created + 1
    if (action === 'ISSUE_CLOSED') updates.issues_closed = stats.issues_closed + 1
    if (action === 'COMMIT') updates.commits_count = stats.commits_count + 1

    await supabase
      .from('user_stats')
      .update(updates)
      .eq('user_id', userId)
  }

  // Check for badge eligibility
  await checkAndAwardBadges(userId)
}

async function checkAndAwardBadges(userId: string): Promise<void> {
  const supabase = getServiceSupabase()

  // Get user stats
  const { data: stats } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!stats) return

  // Get all badges
  const { data: allBadges } = await supabase
    .from('badges')
    .select('*')

  if (!allBadges) return

  // Get user's current badges
  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId)

  const ownedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || [])

  // Check each badge
  for (const badge of allBadges) {
    if (ownedBadgeIds.has(badge.id)) continue

    let shouldAward = false

    // Badge logic
    if (badge.name === 'First Steps' && stats.prs_opened >= 1) shouldAward = true
    if (badge.name === 'Getting Started' && stats.prs_opened >= 5) shouldAward = true
    if (badge.name === 'Contributor' && stats.xp >= 100) shouldAward = true
    if (badge.name === 'Active Developer' && stats.xp >= 500) shouldAward = true
    if (badge.name === 'Code Master' && stats.xp >= 1000) shouldAward = true
    if (badge.name === 'Team Player' && stats.prs_reviewed >= 10) shouldAward = true
    if (badge.name === 'Issue Hunter' && stats.issues_closed >= 20) shouldAward = true

    if (shouldAward) {
      await supabase.from('user_badges').insert({
        user_id: userId,
        badge_id: badge.id,
      })
    }
  }
}

export async function getLeaderboard(limit: number = 10) {
  const supabase = getServiceSupabase()

  const { data } = await supabase
    .from('user_stats')
    .select(`
      *,
      users:user_id (username, avatar_url, name)
    `)
    .order('xp', { ascending: false })
    .limit(limit)

  return data
}

export async function getUserStats(userId: string) {
  const supabase = getServiceSupabase()

  const [stats, badges] = await Promise.all([
    supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('user_badges')
      .select(`
        *,
        badges:badge_id (*)
      `)
      .eq('user_id', userId)
  ])

  return {
    stats: stats.data,
    badges: badges.data
  }
}
