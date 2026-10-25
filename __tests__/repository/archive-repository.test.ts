import { jest } from '@jest/globals'
import * as core from '../../__fixtures__/@actions/core.js'
import * as github from '../../__fixtures__/@actions/github.js'
import * as octokit from '../../__fixtures__/@octokit/rest.js'
import * as issues from '../../__fixtures__/utils/issues.js'

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

jest.unstable_mockModule('../../action/utils/issues.js', () => issues)

const { archiveRepository } =
  await import('../../action/repository/archive-repository.js')

const { Octokit } = await import('@octokit/rest')
const mocktokit = jest.mocked(new Octokit())

const issueOpsInputs = {
  organization: 'EficodeDemoOrg',
  repository: 'self-service',
  issueNumber: 1
}

describe('archiveRepository', () => {
  beforeEach(() => {
    github.context.repo.owner = 'EficodeDemoOrg'

    mocktokit.rest.repos.get.mockResolvedValue({
      data: {
        archived: false
      }
    } as any)

    core.getInput.mockReturnValue(
      JSON.stringify({
        archive_repository_organization: 'EficodeDemoOrg',
        archive_repository_name: 'self-service'
      })
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Archives a repository (demo mode)', async () => {
    await archiveRepository(issueOpsInputs)

    expect(mocktokit.rest.repos.update).not.toHaveBeenCalled()
    expect(issues.addComment).toHaveBeenCalled()
    expect(issues.closeIssue).toHaveBeenCalled()
  })

  it('Archives a repository (live mode)', async () => {
    github.context.repo.owner = 'not-EficodeDemoOrg'

    await archiveRepository(issueOpsInputs)

    expect(mocktokit.rest.repos.update).toHaveBeenCalledWith({
      owner: 'EficodeDemoOrg',
      repo: 'self-service',
      archived: true
    })
    expect(issues.addComment).toHaveBeenCalled()
    expect(issues.closeIssue).toHaveBeenCalled()
  })

  it('Does nothing if repository is already archived (live mode)', async () => {
    mocktokit.rest.repos.get.mockResolvedValue({
      data: {
        archived: true
      }
    } as any)

    github.context.repo.owner = 'not-EficodeDemoOrg'

    await archiveRepository(issueOpsInputs)

    expect(mocktokit.rest.repos.update).not.toHaveBeenCalled()
    expect(issues.addComment).toHaveBeenCalled()
    expect(issues.closeIssue).toHaveBeenCalled()
  })
})
