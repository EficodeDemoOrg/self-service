import { jest } from '@jest/globals'
import * as core from '../../__fixtures__/@actions/core.js'
import * as github from '../../__fixtures__/@actions/github.js'

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => github)

const inputs = await import('../../action/utils/inputs.js')

describe('getIssueOpsInputs', () => {
  beforeEach(() => {
    core.getInput
      .mockReturnValueOnce('EficodeDemoOrg') // issue_ops_organization
      .mockReturnValueOnce('self-service') // issue_ops_repository
      .mockReturnValueOnce('1') // issue_number
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Gets the inputs', async () => {
    const response = inputs.getIssueOpsInputs()

    expect(response).toMatchObject({
      organization: 'EficodeDemoOrg',
      repository: 'self-service',
      issueNumber: 1
    })
  })
})
