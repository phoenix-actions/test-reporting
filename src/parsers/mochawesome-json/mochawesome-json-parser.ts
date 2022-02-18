/* eslint-disable github/array-foreach */
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
import {MochawesomeJson, MochawesomeJsonTest} from './mochawesome-json-types'

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

    const results = mochawesome.results[0]
    const suites = results?.suites
    const filePath = results?.fullFile
    const suitelessTests = results?.tests

    const getSuite = (): TestSuiteResult => {
      const path = this.getRelativePath(filePath)
      return suitesMap[path] ?? (suitesMap[path] = new TestSuiteResult(path, []))
    }

    const processPassingTests = (tests: MochawesomeJsonTest[]): void =>
      tests
        .filter(test => test.pass)
        .forEach(passingTest => {
          const suite = getSuite()
          this.processTest(suite, passingTest, 'success')
        })

    const processFailingTests = (tests: MochawesomeJsonTest[]): void =>
      tests
        .filter(test => test.fail)
        .forEach(failingTest => {
          const suite = getSuite()
          this.processTest(suite, failingTest, 'failed')
        })

    const processPendingTests = (tests: MochawesomeJsonTest[]): void =>
      tests
        .filter(test => test.pending)
        .forEach(pendingTest => {
          const suite = getSuite()
          this.processTest(suite, pendingTest, 'skipped')
        })

    const processAllTests = (tests: MochawesomeJsonTest[]): void => {
      processPassingTests(tests)
      processFailingTests(tests)
      processPendingTests(tests)
    }

    // Process tests that aren't in a suite
    if (suitelessTests?.length > 0) {
      processAllTests(suitelessTests)
    }

    // Process tests that are in a suite
    if (suites?.length > 0) {
      suites.forEach(suite => {
        // Process suite tests
        processAllTests(suite.tests)

        let nestedSuiteIterator = 0

        // Handle nested suites
        const processNestedSuites = (): void => {
          const innerSuite = suite.suites[nestedSuiteIterator]

          if (innerSuite) {
            // Process inner suite tests
            processAllTests(innerSuite.tests)

            const innerSuites = innerSuite.suites

            // If the inner suite has more suites, recursion
            if (innerSuites?.length > 0) {
              processNestedSuites()
            } else {
              nestedSuiteIterator++
            }
          }
        }

        processNestedSuites()
      })
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
