# Changelog

## v1.5.0
- [Add option to convert backslashes in path pattern to forward slashes](https://github.com/phoenix-actions/test-reporting/pull/128)
- [Add option to generate only the summary from processed test results files](https://github.com/phoenix-actions/test-reporting/pull/123)

## v1.4.3
- [Patch java-junit to handle missing time field](https://github.com/phoenix-actions/test-reporting/pull/115)
- [Fix dart-json parsing broken by print message](https://github.com/phoenix-actions/test-reporting/pull/114)

## v1.4.2
- [Fix dotnet-trx parsing of passed tests with non-empty error info](https://github.com/phoenix-actions/test-reporting/commit/43d89d5ee509bcef7bd0287aacc0c4a4fb9c1657)

## v1.4.1
- [Fix dotnet-trx parsing of tests with custom display names](https://github.com/phoenix-actions/test-reporting/pull/105)

## v1.4.0
- [Add support for mocha-json](https://github.com/phoenix-actions/test-reporting/pull/90)
- [Use full URL to fix navigation from summary to suite details](https://github.com/phoenix-actions/test-reporting/pull/89)
- [New report rendering with code blocks instead of tables](https://github.com/phoenix-actions/test-reporting/pull/88)
- [Improve test error messages from flutter](https://github.com/phoenix-actions/test-reporting/pull/87)

## v1.3.1
- [Fix: parsing of .NET duration string without milliseconds](https://github.com/phoenix-actions/test-reporting/pull/84)
- [Fix: dart-json - remove group name from test case names](https://github.com/phoenix-actions/test-reporting/pull/85)
- [Fix: net-trx parser crashing on missing duration attribute](https://github.com/phoenix-actions/test-reporting/pull/86)

## v1.3.0
- [Add support for java-junit](https://github.com/phoenix-actions/test-reporting/pull/80)
- [Fix: Handle test reports with no test cases](https://github.com/phoenix-actions/test-reporting/pull/70)
- [Fix: Reduce number of API calls to get list of files tracked by GitHub](https://github.com/phoenix-actions/test-reporting/pull/69)

## v1.2.0
- [Set `listTests` and `listSuites` to lower detail if report is too big](https://github.com/phoenix-actions/test-reporting/pull/60)

## v1.1.0
- [Support public repo PR workflow](https://github.com/phoenix-actions/test-reporting/pull/56)

## v1.0.0
Supported languages / frameworks:
- .NET / xUnit / NUnit / MSTest
- Dart / test
- Flutter / test
- JavaScript / JEST
