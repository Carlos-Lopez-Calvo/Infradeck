import test from 'node:test'
import assert from 'node:assert/strict'
import {
  canApplyCurrencyDelta,
  extractBearerToken,
  normalizeRewardPayload,
} from './auth-economy-utils.js'

test('extractBearerToken reads valid bearer header', () => {
  assert.equal(extractBearerToken('Bearer abc.def'), 'abc.def')
})

test('extractBearerToken rejects invalid headers', () => {
  assert.equal(extractBearerToken(undefined), null)
  assert.equal(extractBearerToken('Token abc.def'), null)
  assert.equal(extractBearerToken('Bearer'), null)
})

test('normalizeRewardPayload normalizes positive values', () => {
  const result = normalizeRewardPayload({ gold: 10.9, gems: 2.1 })
  assert.equal(result.ok, true)
  if (!result.ok) {
    throw new Error('Expected normalized payload')
  }
  assert.deepEqual(result.value, { gold: 10, gems: 2 })
})

test('normalizeRewardPayload rejects invalid values', () => {
  assert.deepEqual(normalizeRewardPayload({ gold: -1, gems: 0 }), {
    ok: false,
    error: 'rewards_must_be_positive',
  })
  assert.deepEqual(normalizeRewardPayload({ gold: Number.NaN, gems: 0 }), {
    ok: false,
    error: 'invalid_reward_payload',
  })
})

test('canApplyCurrencyDelta blocks negative final balances', () => {
  assert.equal(canApplyCurrencyDelta({ gold: 100, gems: 10 }, { gold: -30, gems: 0 }), true)
  assert.equal(canApplyCurrencyDelta({ gold: 100, gems: 10 }, { gold: -130, gems: 0 }), false)
  assert.equal(canApplyCurrencyDelta({ gold: 100, gems: 10 }, { gold: 0, gems: -11 }), false)
})
