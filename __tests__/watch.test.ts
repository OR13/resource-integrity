/**
 * Unit tests for src/watch.ts
 */

import { watch } from '../src/watch'
// import { expect } from '@jest/globals'
import fs from 'fs'
import yaml from 'yaml'

describe('watch.ts', () => {
  it('watches resources for changes', async () => {
    const { resources } = JSON.parse(
      JSON.stringify(yaml.parse(fs.readFileSync('./resources.yaml').toString()))
    )
    const changes = await watch(resources)
    console.log(changes)
  })
})
