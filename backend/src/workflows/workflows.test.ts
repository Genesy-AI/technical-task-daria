import { TestWorkflowEnvironment } from '@temporalio/testing'
import { Worker } from '@temporalio/worker'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { verifyEmailWorkflow } from './workflows'

// Explicit extension: unlike the ts-node runtime, vitest does not teach
// require.resolve to find extensionless .ts modules.
const workflowsPath = path.join(__dirname, 'workflows.ts')

/**
 * Regression guard for the "email verification hangs indefinitely" bug.
 *
 * The activity was proxied with a 1s startToCloseTimeout and no retry policy.
 * Temporal's default policy is unlimited attempts, so any lead whose provider
 * call took longer than 1s retried forever: the workflow never closed, the
 * HTTP request never responded, and the user got no success or failure.
 *
 * These tests assert the workflow always reaches a terminal state.
 */
describe('verifyEmailWorkflow', () => {
  let env: TestWorkflowEnvironment

  beforeAll(async () => {
    env = await TestWorkflowEnvironment.createLocal()
  }, 60_000)

  afterAll(async () => {
    await env?.teardown()
  })

  const runWith = async (
    verifyEmail: (email: string) => Promise<boolean>,
    email: string
  ) => {
    const worker = await Worker.create({
      connection: env.nativeConnection,
      taskQueue: 'test',
      workflowsPath,
      activities: { verifyEmail },
    })

    return worker.runUntil(
      env.client.workflow.execute(verifyEmailWorkflow, {
        taskQueue: 'test',
        workflowId: `test-verify-${email}`,
        args: [email],
      })
    )
  }

  it('returns the provider result for a fast lead', async () => {
    await expect(runWith(async () => true, 'fast@example.com')).resolves.toBe(true)
  }, 60_000)

  it('completes for a slow provider instead of retrying forever', async () => {
    // 5s is well over the old 1s budget — under the old options this call
    // timed out on every attempt and the workflow never terminated.
    const slow = async () => {
      await new Promise((resolve) => setTimeout(resolve, 5_000))
      return true
    }

    await expect(runWith(slow, 'slow@example.com')).resolves.toBe(true)
  }, 60_000)

  it('gives up with a definite error when the provider keeps failing', async () => {
    let attempts = 0
    const alwaysFails = async () => {
      attempts += 1
      throw new Error('provider unavailable')
    }

    // Under the old options (no retry policy) Temporal defaulted to unlimited
    // attempts, so a persistently failing provider retried forever and the
    // caller never learned the outcome. The workflow must now reject.
    await expect(runWith(alwaysFails, 'failing@example.com')).rejects.toThrow()
    expect(attempts).toBe(3)
  }, 60_000)
})
