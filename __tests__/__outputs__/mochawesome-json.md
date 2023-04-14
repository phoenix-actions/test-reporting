![Tests failed](https://img.shields.io/badge/tests-1%20passed%2C%204%20failed-critical)
## ❌ <a id="user-content-r0" href="#r0">fixtures/mochawesome-json.json</a>
**5** tests were completed in **14ms** with **1** passed, **4** failed and **0** skipped.
|Test suite|Passed|Failed|Skipped|Time|
|:---|---:|---:|---:|---:|
|[In-line test with no file](#r0s0)||1❌||3ms|
|[Test 1](#r0s1)|1✔️|2❌||2ms|
|[Test 2](#r0s2)||1❌||0ms|
### ❌ <a id="user-content-r0s0" href="#r0s0">In-line test with no file</a>
```
❌ Timeout test
	Error: Timeout of 1ms exceeded. For async tests and hooks, ensure "done()" is called; if returning a Promise, ensure it resolves. (/Users/work/Source/Repos/thirdparty/phoenix-test-reporter/reports/mochawesome/test/second.test.js)
```
### ❌ <a id="user-content-r0s1" href="#r0s1">Test 1</a>
```
Test 1
  ✔️ Passing test
Test 1 Test 1.1
  ❌ Exception in target unit
	Error: Some error
  ❌ Failing test
	AssertionError: Expected values to be strictly equal:
	
	false !== true
	
```
### ❌ <a id="user-content-r0s2" href="#r0s2">Test 2</a>
```
Test 2
  ❌ Exception in test
	Error: Some error
```