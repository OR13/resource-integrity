/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Mock the GitHub Actions core library
let debugMock: jest.SpiedFunction<typeof core.debug>
let errorMock: jest.SpiedFunction<typeof core.error>
let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
  })

  it('success when no changes', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'resources':
          return './__tests__/data/resources.yaml'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()
    // Verify that all of the core library functions were called correctly
    expect(debugMock).toHaveBeenNthCalledWith(1, 'Checking resources ...')
    expect(errorMock).not.toHaveBeenCalled()
  })

  it('error message indicates which resources have hashes different than expected', async () => {
    // this mock has an expected hash that will not match the remote or the local cache
    // this will be a common case for developer misconfiguration
    getInputMock.mockImplementation(name => {
      switch (name) {
        case 'resources':
          return './__tests__/data/resources.broken.yaml'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    const expectedError = `
{
  "message": "Resources have changes",
  "changes": [
    {
      "id": "https://www.w3.org/ns/credentials/v2",
      "media-type": "application/ld+json",
      "digest-algorithm": "sha-256",
      "expected-resource-digest": "11d22e074ea436daaaabd6954a8e73c634915e980d54656f044c7fb26fb490f6",
      "remote-resource-digest": "374e31a83aff78a98ef4e692bb91df652cf6f07b73c387b9db8c991bfa7542fa"
    },
    {
      "id": "https://www.w3.org/ns/credentials/v2",
      "media-type": "application/ld+json",
      "digest-algorithm": "sha-256",
      "expected-resource-digest": "11d22e074ea436daaaabd6954a8e73c634915e980d54656f044c7fb26fb490f6",
      "cached-resource-digest": "374e31a83aff78a98ef4e692bb91df652cf6f07b73c387b9db8c991bfa7542fa"
    }
  ]
}
    `.trim()
    expect(setFailedMock).toHaveBeenNthCalledWith(1, expectedError)
    expect(errorMock).not.toHaveBeenCalled()
  })
})
