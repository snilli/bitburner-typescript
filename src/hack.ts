import { NS } from '@ns'

interface ServerStat {
	name: string
	hackSkill: number
	port: number
	ram: number
}
export async function main(ns: NS): Promise<void> {
	const allServer = new Map<string, ServerStat>()
	const scan = (name: string) => {
		const hostList = ns.scan(name)
		for (const host of hostList) {
			if (allServer.has(host)) {
				continue
			}
			if (host === 'home') {
				continue
			}

			allServer.set(host, {
				name: host,
				hackSkill: ns.getServerRequiredHackingLevel(host),
				port: ns.getServerNumPortsRequired(host),
				ram: ns.getServerMaxRam(host),
			})
			scan(host)
		}
	}
	scan('home')
	while (true) {
		await ns.sleep(1000)
		const appOpenPort = ['BruteSSH.exe', 'SQLInject.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe']
		const allApp = ns.ls('home').filter((file) => appOpenPort.find((app) => app === file))
		// const targetHost = 'omega-net'
		// const targetHost = 'johnson-ortho'
		// const targetHost = 'joesguns'
		// const targetHost = 'the-hub'
		// const targetHost = 'icarus' //lvl 900+
		const targetHost = 'n00dles'
		const scriptName = 'loop-hack.js'

		const serverPrefix = 'meeq'
		const scriptUsageRam = ns.getScriptRam(scriptName)
		const myHackingSkill = ns.getHackingLevel()
		if (!scriptUsageRam) {
			return
		}
		for (const [host, serverDetail] of allServer.entries()) {
			if (serverDetail.hackSkill > myHackingSkill) {
				continue
			}
			const isMyServer = host.startsWith(serverPrefix)
			if (serverDetail.port > allApp.length && !isMyServer) {
				continue
			}
			const isRootAccess = ns.hasRootAccess(host)
			if (!isMyServer && !isRootAccess) {
				for (const app of allApp) {
					switch (app) {
						case 'BruteSSH.exe':
							ns.brutessh(host)
							break
						case 'FTPCrack.exe':
							ns.ftpcrack(host)
							break
						case 'relaySMTP.exe':
							ns.relaysmtp(host)
							break
						case 'HTTPWorm.exe':
							ns.httpworm(host)
							break
						case 'SQLInject.exe':
							ns.sqlinject(host)
							break
					}
				}
				ns.nuke(host)
			}
			if (!serverDetail.ram) {
				continue
			}
			const threads = Math.floor(serverDetail.ram / scriptUsageRam)
			if (!threads) {
				continue
			}
			if (!ns.isRunning(scriptName, host, targetHost)) {
				ns.scriptKill(scriptName, host)
				ns.rm(scriptName, host)
				await ns.scp(scriptName, host)
				ns.exec(scriptName, host, threads, targetHost)
			}
			// const server = ns.getServer(host)
			// if (!server) {
			// 	continue
			// }
			// if (server.backdoorInstalled) {

			// }
		}
	}
}
