import {ParseOptions, TestParser} from '../../test-parser'
import {
  TestCaseError,
  TestCaseResult,
  TestExecutionResult,
  TestGroupResult,
  TestRunResult,
  TestSuiteResult
} from '../../test-results'
import {getExceptionSource} from '../../utils/node-utils'
import {getBasePath, normalizeFilePath} from '../../utils/path-utils'
import {MochawesomeJson, MochawesomeJsonSuite, MochawesomeJsonTest} from './mochawesome-json-types'

export class MochawesomeJsonParser implements TestParser {
  assumedWorkDir: string | undefined

  constructor(readonly options: ParseOptions) {}

  async parse(path: string, content: string): Promise<TestRunResult> {
    const mochawesome = this.getMochawesomeJson(path, content)
    const result = this.getTestRunResult(path, mochawesome)
    result.sort(true)
    return Promise.resolve(result)
  }

  private getMochawesomeJson(path: string, content: string): MochawesomeJson {
    try {
      return JSON.parse(content)
    } catch (e) {
      throw new Error(`Invalid JSON at ${path}\n\n${e}`)
    }
  }

  private getTestRunResult(resultsPath: string, mochawesome: MochawesomeJson): TestRunResult {
    const suitesMap: {[path: string]: TestSuiteResult} = {}

    const results = mochawesome.results

    const getSuite = (fullFile: string): TestSuiteResult => {
      const path = this.getRelativePath(fullFile)
      return suitesMap[path] ?? (suitesMap[path] = new TestSuiteResult(path, []))
    }

    const processPassingTests = (tests: MochawesomeJsonTest[], suiteName: string): void => {
      const passingTests = tests?.filter(test => test.pass)

      if (passingTests) {
        for (const passingTest of passingTests) {
          const suite = getSuite(suiteName)
          this.processTest(suite, passingTest, 'success')
        }
      }
    }

    const processFailingTests = (tests: MochawesomeJsonTest[], suiteName: string): void => {
      const failingTests = tests?.filter(test => test.fail)

      if (failingTests) {
        for (const failingTest of failingTests) {
          const suite = getSuite(suiteName)
          this.processTest(suite, failingTest, 'failed')
        }
      }
    }

    const processPendingTests = (tests: MochawesomeJsonTest[], suiteName: string): void => {
      const pendingTests = tests?.filter(test => test.skipped)

      if (pendingTests) {
        for (const pendingTest of pendingTests) {
          const suite = getSuite(suiteName)
          this.processTest(suite, pendingTest, 'skipped')
        }
      }
    }

    const processAllTests = (tests: MochawesomeJsonTest[], suiteName: string): void => {
      processPassingTests(tests, suiteName)
      processFailingTests(tests, suiteName)
      processPendingTests(tests, suiteName)
    }

    // Handle nested suites
    const processNestedSuites = (suite: MochawesomeJsonSuite, nestedSuiteIndex: number, suiteName: string): void => {
      // Process suite tests
      processAllTests(suite.tests, suiteName)

      for (const innerSuite of suite.suites) {
        // Process inner suite tests
        processAllTests(innerSuite.tests, suiteName)

        if (innerSuite?.suites[nestedSuiteIndex]?.suites.length > 0) {
          processNestedSuites(innerSuite, 0, suiteName)
        } else {
          processAllTests(innerSuite?.suites[nestedSuiteIndex]?.tests, suiteName)
          nestedSuiteIndex++

          // TODO - Figure out how to get 1.1.1.1.2 - suites with more than one object in them
        }
      }
    }

    // Process Mochawesome Data
    for (const result of results) {
      const suites = result?.suites
      const filePath = result?.fullFile
      const suitelessTests = result?.tests

      // Process tests that aren't in a suite
      if (suitelessTests?.length > 0) {
        processAllTests(suitelessTests, filePath)
      }

      // Process tests that are in a suite
      if (suites?.length > 0) {
        for (const suite of suites) {
          processNestedSuites(suite, 0, filePath ? filePath : result?.title)
        }
      }
    }

    const mappedSuites = Object.values(suitesMap)

    return new TestRunResult(resultsPath, mappedSuites, mochawesome.stats.duration)
  }

  private processTest(suite: TestSuiteResult, test: MochawesomeJsonTest, result: TestExecutionResult): void {
    const groupName =
      test.fullTitle !== test.title
        ? test.fullTitle.substr(0, test.fullTitle.length - test.title.length).trimEnd()
        : null

    let group = suite.groups.find(grp => grp.name === groupName)
    if (group === undefined) {
      group = new TestGroupResult(groupName, [])
      suite.groups.push(group)
    }

    const error = this.getTestCaseError(test)
    const testCase = new TestCaseResult(test.title, result, test.duration ?? 0, error)
    group.tests.push(testCase)
  }

  private getTestCaseError(test: MochawesomeJsonTest): TestCaseError | undefined {
    const details = test.err.estack
    const message = test.err.message
    if (details === undefined) {
      return undefined
    }

    let path
    let line

    const src = getExceptionSource(details, this.options.trackedFiles, file => this.getRelativePath(file))
    if (src) {
      path = src.path
      line = src.line
    }

    return {
      path,
      line,
      message,
      details
    }
  }

  private getRelativePath(path: string): string {
    path = normalizeFilePath(path)
    const workDir = this.getWorkDir(path)
    if (workDir !== undefined && path.startsWith(workDir)) {
      path = path.substr(workDir.length)
    }
    return path
  }

  private getWorkDir(path: string): string | undefined {
    return (
      this.options.workDir ??
      this.assumedWorkDir ??
      (this.assumedWorkDir = getBasePath(path, this.options.trackedFiles))
    )
  }
}
