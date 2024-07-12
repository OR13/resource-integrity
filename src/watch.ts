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

export type ChangedResource = {
  id: string // url
  'media-type': string,
  'digest-algorithm': string,
  'expected-resource-digest': string,
  'remote-resource-digest'?: string
  'cached-resource-digest'?: string
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
    const { data: remoteResourceData } = await axios.get(resource.id, {
      headers: {
        Accept: resource['media-type']
      },
      transformResponse: r => r
    })
    const hashAlg = IANAHashToNodeHash[resource['hash-algorithm']]
    const remoteResourceDigest = crypto
      .createHash(hashAlg)
      .update(remoteResourceData, 'utf8')
      .digest('hex')

    const cachedResource = fs.readFileSync(resource['cached-resource'])
    const cachedResourceDigest = crypto
      .createHash(hashAlg)
      .update(cachedResource)
      .digest('hex')
    if (
      remoteResourceDigest !== resource['hash-digest']
    ) {
      
      changes.push({
        id: resource.id,
        'media-type': resource['media-type'],
        'digest-algorithm': resource['hash-algorithm'],
        'expected-resource-digest': resource['hash-digest'],
        'remote-resource-digest': remoteResourceDigest,
      })
    }
    if (
      cachedResourceDigest !== resource['hash-digest']
    ) {
      changes.push({
        id: resource.id,
        'media-type': resource['media-type'],
        'digest-algorithm': resource['hash-algorithm'],
        'expected-resource-digest': resource['hash-digest'],
        'cached-resource-digest': cachedResourceDigest,
      })
    }
  }
  return changes
}
