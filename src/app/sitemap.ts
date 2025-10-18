import {MetadataRoute} from 'next'
import {getSpaces} from "@/lib/api";


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.say-it.xyz"

  const spaces = await getSpaces()
  const spaceUrls = spaces.map((space) => ({
    url: `${baseUrl}/${space.name}`,
    lastModified: new Date(space.createdAt || new Date()),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
  ]


  return [
    ...staticUrls,
    ...spaceUrls]
}