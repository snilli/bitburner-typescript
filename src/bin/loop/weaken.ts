import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
	const host = ns.args[0].toString()
	await ns.weaken(host)
}
