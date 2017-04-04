import * as assert from 'assert'
import {encode, decode} from './index'

const DATE = new Date()
const DOCUMENT = [
	{hello: 'World!'},
	{hello: 'World!'},
	{hello: 123},
	{hello: DATE},
	{hello: true},
]
const ENCODED = encode(DOCUMENT)
console.log(ENCODED)
assert.deepEqual(ENCODED, [
	['hello', 'World!'], [
	{'0': '1'},
	{'0': '1'},
	{'0': 123},
	{'0': `d:${DATE.getTime()}`},
	{'0': true},
]])
assert.deepEqual(decode(ENCODED), DOCUMENT)
console.log('All tests passed!')
