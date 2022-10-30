import { NS } from '@ns'
import { findBestServerToHack, getServersInfos } from '/compiler/utilities'
import { ServerInfo } from '/lib/server'

export async function main(ns: NS): Promise<void> {
	ns.disableLog('sleep')
	const serversData = Array.from(getServersInfos(ns))
	const target: ServerInfo = new ServerInfo(ns, findBestServerToHack(ns))

	const moneyThreshold = target.money.max * 0.75
	const securityThreshold = target.security.min + 5

	while (true) {
		for (const [, server] of serversData) {
			if (!server.admin) {
				server.penetrate()
			}
			let targetMoney = target.money.available
			if (targetMoney < 1) {
				targetMoney = 1
			}

			let weakenThreads = Math.ceil(
				(target.security.level - target.security.min) / ns.weakenAnalyze(1),
			)
			let hackThreads = Math.ceil(ns.hackAnalyzeThreads(target.hostname, targetMoney))
			let growThreads = Math.ceil(ns.growthAnalyze(target.hostname, target.money.max / targetMoney))
			let availableThreads = server.calculateThreadCount(1.75)

			const canHack = ns.getHackingLevel() >= server.hackLevel
			if (!canHack) {
				continue
			}

			if (target.security.level > securityThreshold) {
				weakenThreads = Math.min(availableThreads, weakenThreads)
				if (weakenThreads)
					ns.exec('bin/loop/weaken.js', server.hostname, weakenThreads, target.hostname)
			} else if (target.money.available < moneyThreshold) {
				growThreads = Math.min(availableThreads, growThreads)
				if (growThreads)
					ns.exec('bin/loop/grow.js', server.hostname, growThreads, target.hostname)
			} else {
				availableThreads = server.calculateThreadCount(1.7)
				hackThreads = Math.min(availableThreads, hackThreads)
				if (hackThreads)
					ns.exec('bin/loop/hack.js', server.hostname, hackThreads, target.hostname)
			}
		}

		await ns.sleep(1)
	}
}
