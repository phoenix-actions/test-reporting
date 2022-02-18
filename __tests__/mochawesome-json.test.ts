import * as fs from 'fs'
import * as path from 'path'

import {MochawesomeJsonParser} from '../src/parsers/mochawesome-json/mochawesome-json-parser'
import {ParseOptions} from '../src/test-parser'
import {getReport} from '../src/report/get-report'
import {normalizeFilePath} from '../src/utils/path-utils'

describe('mochawesome-json tests', () => {
  it('produces empty test run result when there are no test cases', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'empty', 'mochawesome-json.json')
    const filePath = normalizeFilePath(path.relative(__dirname, fixturePath))
    const fileContent = fs.readFileSync(fixturePath, {encoding: 'utf8'})

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: []
    }

    const parser = new MochawesomeJsonParser(opts)
    const result = await parser.parse(filePath, fileContent)
    expect(result.tests).toBe(0)
    expect(result.result).toBe('success')
  })

  it('report from ./reports/mochawesome-json test results matches snapshot', async () => {
    const fixturePath = path.join(__dirname, 'fixtures', 'mochawesome-json.json')
    const outputPath = path.join(__dirname, '__outputs__', 'mochawesome-json.md')
    const filePath = normalizeFilePath(path.relative(__dirname, fixturePath))
    const fileContent = fs.readFileSync(fixturePath, {encoding: 'utf8'})

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: ['test/main.test.js', 'test/second.test.js', 'lib/main.js']
    }

    const parser = new MochawesomeJsonParser(opts)
    const result = await parser.parse(filePath, fileContent)
    expect(result).toMatchSnapshot()

    const report = getReport([result])
    fs.mkdirSync(path.dirname(outputPath), {recursive: true})
    fs.writeFileSync(outputPath, report)
  })

  // TODO - External
  // it('report from mochawesomejs/mochawesome test results matches snapshot', async () => {
  //   const fixturePath = path.join(__dirname, 'fixtures', 'external', 'mochawesome', 'mochawesome-test-results.json')
  //   const trackedFilesPath = path.join(__dirname, 'fixtures', 'external', 'mochawesome', 'files.txt')
  //   const outputPath = path.join(__dirname, '__outputs__', 'mochawesome-test-results.md')
  //   const filePath = normalizeFilePath(path.relative(__dirname, fixturePath))
  //   const fileContent = fs.readFileSync(fixturePath, {encoding: 'utf8'})

  //   const trackedFiles = fs.readFileSync(trackedFilesPath, {encoding: 'utf8'}).split(/\n\r?/g)
  //   const opts: ParseOptions = {
  //     parseErrors: true,
  //     trackedFiles
  //   }

  //   const parser = new MochawesomeJsonParser(opts)
  //   const result = await parser.parse(filePath, fileContent)
  //   expect(result).toMatchSnapshot()

  //   const report = getReport([result])
  //   fs.mkdirSync(path.dirname(outputPath), {recursive: true})
  //   fs.writeFileSync(outputPath, report)
  // })
})
