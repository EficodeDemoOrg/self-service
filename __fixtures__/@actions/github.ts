import * as octokit from '../@octokit/rest.js'

export const getOctokit = () => octokit

export const context = {
  eventName: 'issues',
  runId: 1234,
  job: 'job-name',
  payload: {},
  repo: {
    owner: 'EficodeDemoOrg',
    repo: 'self-service'
  }
}
