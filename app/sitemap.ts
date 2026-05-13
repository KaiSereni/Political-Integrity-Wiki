import { MetadataRoute } from 'next'
import { getAllCandidates, getAccountabilityPeriods } from '@/lib/data'
import { BASE_URL } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const candidateEntries: MetadataRoute.Sitemap = []

  try {
    const candidates = await getAllCandidates(1000)

    for (const candidate of candidates) {
      const periods = await getAccountabilityPeriods(candidate.id)
      
      // Add base candidate URL
      candidateEntries.push({
        url: `${BASE_URL}/candidate/${candidate.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })

      // Add period-specific URLs
      for (const period of periods) {
        candidateEntries.push({
          url: `${BASE_URL}/candidate/${candidate.id}/${period.id}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.8,
        })
      }
    }
  } catch (error) {
    console.error('Failed to generate dynamic sitemap entries:', error)
    // Fallback to static pages only if dynamic fetch fails
  }

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/leaderboard`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...candidateEntries,
  ]
}
