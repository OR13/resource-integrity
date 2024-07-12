import * as core from '@actions/core'
import { watch } from './watch'
import fs from 'fs'
import yaml from 'yaml'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const resourcesPath: string = core.getInput('resources')
    core.debug(`Checking resources ...`)
    const { resources } = JSON.parse(
      JSON.stringify(yaml.parse(fs.readFileSync(resourcesPath).toString()))
    )
    const changes = await watch(resources)
    if (changes.length) {
      const error = JSON.stringify(
        {
          message: 'Resources have changes',
          changes
        },
        null,
        2
      )
      throw new Error(error)
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
