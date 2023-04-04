export interface MochawesomeJson {
  stats: MochawesomeJsonStat
  results: MochawesomeJsonSuite[]
}

export interface MochawesomeJsonStat {
  duration: number
}

export interface MochawesomeJsonSuite {
  tests: MochawesomeJsonTest[]
  suites: MochawesomeJsonSuite[]
  fullFile: string
  title: string
}

export interface MochawesomeJsonTest {
  title: string
  fullTitle: string
  duration: number
  pass: boolean
  fail: boolean
  skipped: boolean
  err: MochawesomeJsonTestError
}

export interface MochawesomeJsonTestError {
  message: string
  estack: string
  diff: string | null // TODO - Not sure if string
}
