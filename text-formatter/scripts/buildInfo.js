import { execFileSync } from 'node:child_process'

export function getBuildInfo(cwd) {
  const git = (...args) => execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()

  try {
    const history = git(
      'log', '--max-count=30', '--format=%H%x00%h%x00%cs%x00%s',
    ).split('\n').filter(Boolean).map((line) => {
      const [id, version, date, subject] = line.split('\0')
      return { id, version, date, subject }
    })

    return {
      version: history[0].version,
      hasLocalChanges: Boolean(git('status', '--porcelain', '--untracked-files=normal')),
      history,
    }
  } catch {
    return { version: null, hasLocalChanges: false, history: [] }
  }
}
