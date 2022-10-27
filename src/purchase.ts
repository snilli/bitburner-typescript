import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
	const ram = 1024
	const purchaseServers = ns.getPurchasedServers()
	const scriptName = 'loop-hack.js'
	// const targetHost = 'joesguns'
	const targetHost = 'mega-net'
	// const targetHost = 'johnson-ortho'
	// const targetHost = 'silver-helix'

	// const targetHost = 'n00dles'
	// const targetHost = 'phantasy'
	const scriptUsageRam = ns.getScriptRam(scriptName)
	ns.tprintf(purchaseServers.length.toString())
	ns.tprintf(ns.getPurchasedServerLimit().toString())
	while (purchaseServers.length < ns.getPurchasedServerLimit()) {
		await ns.sleep(200)
		if (ns.getServerMoneyAvailable('home') > ns.getPurchasedServerCost(ram)) {
			const hostname = ns.purchaseServer(`meeq-${purchaseServers.length}`, ram)
			purchaseServers.push(hostname)
			if (!hostname) {
				continue
			}

			if (!ns.fileExists(scriptName, hostname)) {
				await ns.scp(scriptName, hostname)
			}
			const threads = Math.floor(ram / scriptUsageRam)
			ns.exec(scriptName, hostname, threads, targetHost)
		}
	}
}
