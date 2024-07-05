import axios from 'axios'
import crypto from 'node:crypto'

export type ResourceWatch = {
  id: string // url
  'media-type': `application/ld+json` // accept header
  'hash-algorithm': `sha-256` // IANA named hash algorithms registry
  'hash-digest'?: string
}

export type ResourcesWatchList = Array<ResourceWatch>

export type ChangedResource = ResourceWatch & {
  content: string
}

export type ResourceChanges = Array<ChangedResource>

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
    const digestHex = crypto
      .createHash(hashAlg)
      .update(data, 'utf8')
      .digest('hex')
    if (digestHex !== resource['hash-digest']) {
      changes.push({
        ...resource,
        'hash-digest': digestHex,
        content: data
      })
    }
  }
  return changes
}
