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
    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    core.debug(`Checking resources ...`)
    const {resources} = JSON.parse(JSON.stringify(yaml.parse(fs.readFileSync(resourcesPath).toString())))
    const changes = JSON.stringify(await watch(resources), null, 2)
    core.debug(`Resource changes:`)
    core.debug(changes)
    // Set outputs for other workflow steps to use
    core.setOutput('changes', changes)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
