import * as github from '@actions/github'

/**
 * Flag to indicate if the action is running in demo mode.
 *
 * This is used to prevent any actual changes from being made when the action is
 * running in the `issue-ops` organization.
 */
export const DEMO_MODE = () =>
  github.context.repo.owner === 'EficodeDemoOrg' ? true : false
