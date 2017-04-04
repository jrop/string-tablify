import * as typeOf from 'typeof'

export type ObjectTable = string[]

function __index(table: ObjectTable, s: string): number {
	let i = table.indexOf(s)
	if (i == -1) {
		table.push(s)
		i = table.length - 1
	}
	return i
}

function __tablify(obj: object, table: ObjectTable) {
	const converters = new class {
		string(s: string) {
			return __index(table, s).toString()
		}
		date(d: Date) {
			return `d:${d.getTime()}`
		}
		number = (n: number) => n
		boolean = (b: boolean) => b
		array(a: any[]) {
			return a.map(i => __tablify(i, table))
		}
		object(o: object) {
			const data = {}
			for (const nm in (obj as any)) {
				const nmIndex = __index(table, nm)
				data[nmIndex] = __tablify(obj[nm], table)
			}
			return data
		}
	}

	const fn = converters[typeOf(obj)]
	if (fn) return fn(obj)
	else return converters.object(obj)
}

export function encode(obj: any, table: ObjectTable = []) {
	const D = __tablify(obj, table)
	return [table, D]
}

export function decode(obj: any[]) {
	const [rawTable, encodedData] = obj
	const table: ObjectTable = rawTable

	function __from(obj: any) {
		const fn = converters[typeOf(obj)]
		if (fn) return fn(obj)
		else return converters.object(obj)
	}

	const converters = new class {
		array(a: any[]) {
			return a.map(i => __from(i))
		}
		number = (n: number) => n
		boolean = (b: boolean) => b
		string(s: string) {
			if (/^d:/.test(s))
				return new Date(parseInt(s.substring(2)))
			return table[parseInt(s)]
		}
		object(obj: object) {
			const data = {}
			for (const nm in (obj as any)) {
				const nmIndex = parseInt(nm)
				data[table[nmIndex]] = __from(obj[nm])
			}
			return data
		}
	}

	return __from(encodedData)
}
