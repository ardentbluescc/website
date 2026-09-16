// Flattens a player (or list of players) into one CSV with four sections:
// bio, batting stats, bowling stats, match log — each keyed by player name/slug.

function esc(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

function row(fields: unknown[]): string {
  return fields.map(esc).join(',') + '\n'
}

const BIO_HEADERS = ['name', 'slug', 'jerseyNumber', 'group', 'role', 'battingStyle', 'bowlingStyle', 'age', 'dob', 'isCaptain', 'team']
const BATTING_HEADERS = ['playerName', 'playerSlug', 'format', 'matches', 'innings', 'notOut', 'runs', 'balls', 'highScore', 'average', 'strikeRate', 'hundreds', 'fifties', 'fours', 'sixes', 'catches', 'stumpings', 'runOuts']
const BOWLING_HEADERS = ['playerName', 'playerSlug', 'format', 'matches', 'innings', 'balls', 'runs', 'wickets', 'bestBowling', 'average', 'economy', 'strikeRate', 'fourWickets', 'fiveWickets']
const MATCHLOG_HEADERS = ['playerName', 'playerSlug', 'matchId', 'date', 'competition', 'teamLabel', 'opponent', 'result', 'didBat', 'runs', 'balls', 'notOut', 'didBowl', 'overs', 'maidens', 'runsConceded', 'wickets', 'catches', 'stumpings', 'runOuts']

export function buildPlayersCSV(players: any[]): string {
  let out = ''

  out += 'Players\n'
  out += row(BIO_HEADERS)
  for (const p of players) {
    out += row([
      p.name, p.slug, p.jerseyNumber, typeof p.groupTier === 'object' ? p.groupTier?.name : p.groupTier,
      p.role, p.battingStyle, p.bowlingStyle, p.age, p.dob, p.isCaptain,
      typeof p.team === 'object' ? p.team?.name : p.team,
    ])
  }

  out += '\nBatting & Fielding Stats\n'
  out += row(BATTING_HEADERS)
  for (const p of players) {
    for (const s of p.battingStats ?? []) {
      out += row([p.name, p.slug, s.format, s.matches, s.innings, s.notOut, s.runs, s.balls, s.highScore, s.average, s.strikeRate, s.hundreds, s.fifties, s.fours, s.sixes, s.catches, s.stumpings, s.runOuts])
    }
  }

  out += '\nBowling Stats\n'
  out += row(BOWLING_HEADERS)
  for (const p of players) {
    for (const s of p.bowlingStats ?? []) {
      out += row([p.name, p.slug, s.format, s.matches, s.innings, s.balls, s.runs, s.wickets, s.bestBowling, s.average, s.economy, s.strikeRate, s.fourWickets, s.fiveWickets])
    }
  }

  out += '\nMatch Log\n'
  out += row(MATCHLOG_HEADERS)
  for (const p of players) {
    for (const m of p.matchLog ?? []) {
      out += row([p.name, p.slug, m.matchId, m.date, m.competition, m.teamLabel, m.opponent, m.result, m.didBat, m.runs, m.balls, m.notOut, m.didBowl, m.overs, m.maidens, m.runsConceded, m.wickets, m.catches, m.stumpings, m.runOuts])
    }
  }

  return out
}
