import { jest } from '@jest/globals'
import * as core from '../__fixtures__/@actions/core.js'
import * as github from '../__fixtures__/@actions/github.js'
import * as octokit from '../__fixtures__/@octokit/rest.js'

// Mock the imports
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

// Mock the internal modules
type enterprise = typeof import('../action/enterprise/index.js')
const enterpriseMocks = {
  createOrganizationInvitation:
    jest.fn<enterprise['createOrganizationInvitation']>()
}
jest.unstable_mockModule('../action/enterprise/index.js', () => enterpriseMocks)

type organization = typeof import('../action/organization/index.js')
const organizationMocks = {
  createActionsVariable: jest.fn<organization['createActionsVariable']>(),
  createAnnouncement: jest.fn<organization['createAnnouncement']>(),
  createProject: jest.fn<organization['createProject']>(),
  createRepository: jest.fn<organization['createRepository']>(),
  createRepositoryTransfer: jest.fn<organization['createRepositoryTransfer']>()
}
jest.unstable_mockModule(
  '../action/organization/index.js',
  () => organizationMocks
)

type repository = typeof import('../action/repository/index.js')
const repositoryMocks = {
  archiveRepository: jest.fn<repository['archiveRepository']>(),
  changeRepositoryVisibility:
    jest.fn<repository['changeRepositoryVisibility']>(),
  renameRepository: jest.fn<repository['renameRepository']>(),
  unarchiveRepository: jest.fn<repository['unarchiveRepository']>()
}
jest.unstable_mockModule('../action/repository/index.js', () => repositoryMocks)

type approval = typeof import('../action/utils/approvals.js')
const approvalMocks = {
  getStatus: jest.fn<approval['getStatus']>(),
  tagApprovers: jest.fn<approval['tagApprovers']>()
}
jest.unstable_mockModule('../action/utils/approvals.js', () => approvalMocks)

type inputs = typeof import('../action/utils/inputs.js')
const inputsMocks = {
  getIssueOpsInputs: jest.fn<inputs['getIssueOpsInputs']>()
}
jest.unstable_mockModule('../action/utils/inputs.js', () => inputsMocks)

type issues = typeof import('../action/utils/issues.js')
const issuesMocks = {
  addComment: jest.fn<issues['addComment']>(),
  closeIssue: jest.fn<issues['closeIssue']>()
}
jest.unstable_mockModule('../action/utils/issues.js', () => issuesMocks)

const main = await import('../action/main.js')

describe('Main', () => {
  beforeEach(() => {
    // Reset the GitHub context
    github.context.eventName = 'issues'
    github.context.repo.owner = 'EficodeDemoOrg'
    github.context.repo.repo = 'self-service'

    // Mock the IssueOps inputs
    inputsMocks.getIssueOpsInputs.mockReturnValue({
      organization: 'EficodeDemoOrg',
      repository: 'self-service',
      issueNumber: 1234
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Fails if the action is invalid', async () => {
    core.getInput.mockReturnValue('some-invalid-action')

    await main.run()

    expect(core.setFailed).toHaveBeenCalledWith(
      'Unknown Action: some-invalid-action'
    )
  })

  it('Does nothing if the request is pending', async () => {
    core.getInput.mockReturnValue('rename-repository.yml')

    approvalMocks.getStatus.mockResolvedValue({
      pending: ['approver1', 'approver2'],
      state: 'pending'
    })

    await main.run()

    expect(approvalMocks.tagApprovers).toHaveBeenCalled()
  })

  it('Closes the issue if the request is denied', async () => {
    github.context.eventName = 'issue_comment'
    core.getInput.mockReturnValue('rename-repository.yml')

    approvalMocks.getStatus.mockResolvedValue({
      state: 'denied'
    })

    await main.run()

    expect(approvalMocks.tagApprovers).not.toHaveBeenCalled()
    expect(issuesMocks.addComment).toHaveBeenCalled()
    expect(issuesMocks.closeIssue).toHaveBeenCalled()
  })

  it('Processes archive-repository', async () => {
    github.context.eventName = 'issue_comment'
    core.getInput.mockReturnValue('archive-repository.yml')

    approvalMocks.getStatus.mockResolvedValue({
      state: 'approved'
    })

    await main.run()

    expect(approvalMocks.tagApprovers).not.toHaveBeenCalled()
    expect(repositoryMocks.archiveRepository).toHaveBeenCalled()
  })

  it('Processes change-repository-visibility', async () => {
    github.context.eventName = 'issue_comment'
    core.getInput.mockReturnValue('change-repository-visibility.yml')

    approvalMocks.getStatus.mockResolvedValue({
      state: 'approved'
    })

    await main.run()

    expect(approvalMocks.tagApprovers).not.toHaveBeenCalled()
    expect(repositoryMocks.changeRepositoryVisibility).toHaveBeenCalled()
  })

  it('Processes create-actions-variable', async () => {
    github.context.eventName = 'issue_comment'
    core.getInput.mockReturnValue('create-actions-variable.yml')

    approvalMocks.getStatus.mockResolvedValue({
      state: 'approved'
    })

    await main.run()

    expect(approvalMocks.tagApprovers).not.toHaveBeenCalled()
    expect(organizationMocks.createActionsVariable).toHaveBeenCalled()
  })

  it('Processes create-announcement', async () => {
    github.context.eventName = 'issue_comment'
    core.getInput.mockReturnValue('create-announcement.yml')

    approvalMocks.getStatus.mockResolvedValue({
      state: 'approved'
    })

    await main.run()

    expect(approvalMocks.tagApprovers).not.toHaveBeenCalled()
    expect(organizationMocks.createAnnouncement).toHaveBeenCalled()
  })

  it('Processes create-project', async () => {
    github.context.eventName = 'issue_comment'
    core.getInput.mockReturnValue('create-project.yml')

    approvalMocks.getStatus.mockResolvedValue({
      state: 'approved'
    })

    await main.run()

    expect(approvalMocks.tagApprovers).not.toHaveBeenCalled()
    expect(organizationMocks.createProject).toHaveBeenCalled()
  })

  it('Processes create-organization-invitation', async () => {
    github.context.eventName = 'issue_comment'
    core.getInput.mockReturnValue('create-organization-invitation.yml')

    approvalMocks.getStatus.mockResolvedValue({
      state: 'approved'
    })

    await main.run()

    expect(approvalMocks.tagApprovers).not.toHaveBeenCalled()
    expect(enterpriseMocks.createOrganizationInvitation).toHaveBeenCalled()
  })

  it('Processes create-repository-transfer', async () => {
    github.context.eventName = 'issue_comment'
    core.getInput.mockReturnValue('create-repository-transfer.yml')

    approvalMocks.getStatus.mockResolvedValue({
      state: 'approved'
    })

    await main.run()

    expect(approvalMocks.tagApprovers).not.toHaveBeenCalled()
    expect(organizationMocks.createRepositoryTransfer).toHaveBeenCalled()
  })

  it('Processes create-repository', async () => {
    github.context.eventName = 'issue_comment'
    core.getInput.mockReturnValue('create-repository.yml')

    approvalMocks.getStatus.mockResolvedValue({
      state: 'approved'
    })

    await main.run()

    expect(approvalMocks.tagApprovers).not.toHaveBeenCalled()
    expect(organizationMocks.createRepository).toHaveBeenCalled()
  })

  it('Processes rename-repository', async () => {
    github.context.eventName = 'issue_comment'
    core.getInput.mockReturnValue('rename-repository.yml')

    approvalMocks.getStatus.mockResolvedValue({
      state: 'approved'
    })

    await main.run()

    expect(approvalMocks.tagApprovers).not.toHaveBeenCalled()
    expect(repositoryMocks.renameRepository).toHaveBeenCalled()
  })

  it('Processes unarchive-repository', async () => {
    github.context.eventName = 'issue_comment'
    core.getInput.mockReturnValue('unarchive-repository.yml')

    approvalMocks.getStatus.mockResolvedValue({
      state: 'approved'
    })

    await main.run()

    expect(approvalMocks.tagApprovers).not.toHaveBeenCalled()
    expect(repositoryMocks.unarchiveRepository).toHaveBeenCalled()
  })
})
