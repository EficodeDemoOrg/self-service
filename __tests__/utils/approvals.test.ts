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

const approvals = await import('../../action/utils/approvals.js')

const { Octokit } = await import('@octokit/rest')
const mocktokit = jest.mocked(new Octokit())

const issueOpsInputs = {
  organization: 'EficodeDemoOrg',
  repository: 'self-service',
  issueNumber: 1
}

describe('tagApprovers', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Does nothing if no approvals are required', async () => {
    await approvals.tagApprovers(issueOpsInputs, {
      approvers: []
    } as any)

    expect(issues.addComment).not.toHaveBeenCalled()
  })

  it('Adds a comment to the issue requesting approval', async () => {
    await approvals.tagApprovers(issueOpsInputs, {
      approvers: ['@octocat']
    } as any)

    expect(issues.addComment).toHaveBeenCalledWith(
      expect.anything(),
      'EficodeDemoOrg',
      'self-service',
      1,
      expect.stringContaining('- @octocat')
    )
  })

  it('Adds a comment to the issue requesting approval (reopened)', async () => {
    // @ts-expect-error The action property exists on the payload
    github.context.payload.action = 'reopened'

    await approvals.tagApprovers(issueOpsInputs, {
      approvers: ['@octocat']
    } as any)

    expect(issues.addComment).toHaveBeenCalledWith(
      expect.anything(),
      'EficodeDemoOrg',
      'self-service',
      1,
      expect.stringContaining('- @octocat')
    )
  })
})

describe('getStatus', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Returns an empty array if no approvals are required', async () => {
    const status = await approvals.getStatus(issueOpsInputs, {
      approvers: []
    } as any)

    expect(status).toMatchObject({
      state: 'approved'
    })
  })

  it('Gets the approvals from the issue comments (denied)', async () => {
    mocktokit.paginate.mockResolvedValue([
      {
        event: 'commented',
        created_at: '2023-01-01T00:00:00Z',
        body: '/approve',
        user: {
          login: 'octocat'
        }
      },
      {
        event: 'labeled',
        created_at: '2023-01-01T00:00:00Z',
        user: {
          login: 'octocat'
        }
      },
      {
        event: 'reopened',
        created_at: '2023-01-01T00:00:00Z',
        user: {
          login: 'octocat'
        }
      },
      {
        event: 'commented',
        created_at: '2023-01-01T00:00:00Z',
        body: '/deny',
        user: {
          login: 'octocat'
        }
      }
    ])

    const status = await approvals.getStatus(issueOpsInputs, {
      approvers: ['octocat']
    } as any)

    expect(status).toMatchObject({
      state: 'denied'
    })
  })

  it('Gets the approvals from the issue comments (pending)', async () => {
    mocktokit.paginate.mockResolvedValue([
      {
        event: 'commented',
        created_at: '2023-01-01T00:00:00Z',
        body: '/approve',
        user: {
          login: 'mona'
        }
      },
      {
        event: 'labeled',
        created_at: '2023-01-01T00:00:00Z',
        user: {
          login: 'octocat'
        }
      },
      {
        event: 'reopened',
        created_at: '2023-01-01T00:00:00Z',
        user: {
          login: 'octocat'
        }
      },
      {
        event: 'commented',
        created_at: '2023-01-01T00:00:00Z',
        body: '/deny',
        user: {
          login: 'mona'
        }
      }
    ])

    const status = await approvals.getStatus(issueOpsInputs, {
      approvers: ['octocat']
    } as any)

    expect(status).toMatchObject({
      state: 'pending',
      pending: ['octocat']
    })
  })
})
