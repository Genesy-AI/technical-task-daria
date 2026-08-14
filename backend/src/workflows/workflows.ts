import { proxyActivities } from '@temporalio/workflow'
import type * as activities from './activities'

const { verifyEmail } = proxyActivities<typeof activities>({
  // Verification is a network-bound provider call. The previous 1s budget was below
  // the provider's normal latency, so slow-but-healthy leads timed out on every attempt.
  startToCloseTimeout: '30 seconds',
  // Absolute ceiling across all attempts. Without a bounded retry policy Temporal
  // defaults to unlimited attempts, which is what made the workflow run forever.
  scheduleToCloseTimeout: '2 minutes',
  retry: {
    initialInterval: '1 second',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
})

export async function verifyEmailWorkflow(email: string): Promise<boolean> {
  return await verifyEmail(email)
}
