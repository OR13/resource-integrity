import axios from 'axios'
import crypto from 'node:crypto'
import fs from 'fs'

export type ResourceWatch = {
  id: string // url
  'media-type': `application/ld+json` // accept header
  'hash-algorithm': `sha-256` // IANA named hash algorithms registry
  'hash-digest': string
  'cached-resource': string
}

export type ResourcesWatchList = ResourceWatch[]

export type ChangedResource = ResourceWatch & {
  'latest-resource-digest': string
  'latest-resource': string
}

export type ResourceChanges = ChangedResource[]

const IANAHashToNodeHash = {
  'sha-256': 'sha256'
}

/**
 * Watch resources
 * @param resources A collection of resources to observe for changes.
 * @returns {Promise<ResourceChanges>} Resolves with 'changes' list.
 */
export async function watch(
  resources: ResourcesWatchList
): Promise<ResourceChanges> {
  const changes = [] as ResourceChanges
  for (const resource of resources) {
    const { data } = await axios.get(resource.id, {
      headers: {
        Accept: resource['media-type']
      },
      transformResponse: r => r
    })
    const hashAlg = IANAHashToNodeHash[resource['hash-algorithm']]
    const latestResourceDigest = crypto
      .createHash(hashAlg)
      .update(data, 'utf8')
      .digest('hex')

    const cachedResource = fs.readFileSync(resource['cached-resource'])
    const cachedResourceDigest = crypto
      .createHash(hashAlg)
      .update(cachedResource)
      .digest('hex')

    if (
      latestResourceDigest !== resource['hash-digest'] ||
      cachedResourceDigest !== resource['hash-digest']
    ) {
      changes.push({
        ...resource,
        'latest-resource-digest': latestResourceDigest,
        'latest-resource': data
      })
    }
  }
  return changes
}
