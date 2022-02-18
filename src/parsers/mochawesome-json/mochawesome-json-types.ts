export interface MochawesomeJson {
  stats: MochawesomeJsonStat
  results: MochawesomeJsonResult[]
}

export interface MochawesomeJsonStat {
  duration: number
}

export interface MochawesomeJsonResult {
  suites: MochawesomeJsonSuite[]
  fullFile: string
}

export interface MochawesomeJsonSuite {
  tests: MochawesomeJsonTest[]
}

export interface MochawesomeJsonTest {
  title: string
  fullTitle: string
  duration: number
  pass: boolean
  fail: boolean
  pending: boolean
  err: MochawesomeJsonTestError
}

export interface MochawesomeJsonTestError {
  message: string
  estack: string
  diff: string | null // TODO - Not sure if string
}
