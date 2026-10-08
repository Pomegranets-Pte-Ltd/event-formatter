import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { getBuildInfo } from './buildInfo.js'

function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), 'formatter-build-info-'))
  t.after(() => rmSync(cwd, { recursive: true, force: true }))
  const git = (...args) => execFileSync('git', args, {
    cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
  git('init')
  const commit = (subject) => git(
    '-c', 'user.name=Build test', '-c', 'user.email=build@example.invalid',
    '-c', 'commit.gpgsign=false', 'commit', '--allow-empty', '-m', subject,
  )
  return { cwd, git, commit }
}

test('version matches HEAD and preserves commit subjects newest first', (t) => {
  const { cwd, git, commit } = fixture(t)
  commit('First version')
  commit('Fix "paste" & spare APs <on site> — ready')
  const info = getBuildInfo(cwd)
  assert.equal(info.version, git('rev-parse', '--short', 'HEAD'))
  assert.equal(info.hasLocalChanges, false)
  assert.equal(info.history[0].id, git('rev-parse', 'HEAD'))
  assert.match(info.history[0].date, /^\d{4}-\d{2}-\d{2}$/)
  assert.deepEqual(info.history.map(({ subject }) => subject), [
    'Fix "paste" & spare APs <on site> — ready', 'First version',
  ])
})

test('untracked and tracked local edits are distinguished from committed history', (t) => {
  const { cwd, git, commit } = fixture(t)
  commit('Initial version')
  writeFileSync(join(cwd, 'note.txt'), 'Spare router')
  assert.equal(getBuildInfo(cwd).hasLocalChanges, true)
  git('add', 'note.txt')
  commit('Add spare equipment note')
  assert.equal(getBuildInfo(cwd).hasLocalChanges, false)
  writeFileSync(join(cwd, 'note.txt'), 'Spare router and AP')
  const info = getBuildInfo(cwd)
  assert.equal(info.hasLocalChanges, true)
  assert.equal(info.history[0].subject, 'Add spare equipment note')
})

test('history is limited to the latest 30 commits', (t) => {
  const { cwd, commit } = fixture(t)
  for (let index = 1; index <= 31; index++) commit(`Change ${index}`)
  const info = getBuildInfo(cwd)
  assert.equal(info.history.length, 30)
  assert.equal(info.history[0].subject, 'Change 31')
  assert.equal(info.history[29].subject, 'Change 2')
})

test('builds without commits have an explicit unavailable fallback', (t) => {
  const { cwd } = fixture(t)
  assert.deepEqual(getBuildInfo(cwd), {
    version: null, hasLocalChanges: false, history: [],
  })
})
