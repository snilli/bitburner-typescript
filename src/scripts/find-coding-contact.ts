/** @param {NS} ns */
import { NS } from '@ns'
import { getServersInfos } from '/compiler/utilities'

export function main(ns: NS): void {
	ns.disableLog('sleep')
	const serversData = Array.from(getServersInfos(ns))

	for (const [, server] of serversData) {
		const hostName = server.hostname
		const files = ns.ls(hostName, '.cct')
		if (files.length) ns.tprintf(`${hostName} : ${files[0]}`)
	}
}
