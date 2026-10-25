import { jest } from '@jest/globals'
import * as core from '../../__fixtures__/@actions/core.js'
import * as github from '../../__fixtures__/@actions/github.js'
import * as octokit from '../../__fixtures__/@octokit/rest.js'

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => github)
jest.unstable_mockModule('@octokit/rest', () => {
  class Octokit {
    constructor() {
      return octokit
    }
  }

  return {
    Octokit
  }
})

const issues = await import('../../action/utils/issues.js')

const { Octokit } = await import('@octokit/rest')
const mocktokit = jest.mocked(new Octokit())

describe('addComment', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Adds a comment', async () => {
    await issues.addComment(
      mocktokit,
      'EficodeDemoOrg',
      'self-service',
      1,
      'Hello, World!'
    )

    expect(mocktokit.rest.issues.createComment).toHaveBeenCalled()
  })
})

describe('closeIssue', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Closes an issue as completed', async () => {
    await issues.closeIssue(mocktokit, 'EficodeDemoOrg', 'self-service', 1)

    expect(mocktokit.rest.issues.update).toHaveBeenCalled()
  })

  it('Closes an issue as not planned', async () => {
    await issues.closeIssue(
      mocktokit,
      'EficodeDemoOrg',
      'self-service',
      1,
      'not_planned'
    )

    expect(mocktokit.rest.issues.update).toHaveBeenCalled()
  })
})
