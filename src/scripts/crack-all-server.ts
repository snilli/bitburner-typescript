/** @param {NS} ns */
import { NS } from '@ns'
import { getServersInfos } from '/compiler/utilities'

export function main(ns: NS): void {
	ns.disableLog('sleep')
	const scripts = ['/bin/loop/grow.js', '/bin/loop/weaken.js', '/bin/loop/hack.js']
	const serversData = Array.from(getServersInfos(ns))
	const accessDeniedServers = []

	for (const [, server] of serversData) {
		const hostName = server.hostname
		if (server.admin) {
			continue
		}

		if (!server.penetrate()) {
			accessDeniedServers.push({
				name: hostName,
				requirePort: server.ports.required,
				programs: server.programs.available,
			})
			continue
		}

		for (const script of scripts) {
			if (ns.fileExists(script, hostName)) {
				continue
			}

			ns.scp(script, hostName, 'home')
		}
	}

	ns.tprintf(`Access Denied Servers :${JSON.stringify(accessDeniedServers)}`)
}
