import { NS } from '@ns'
import { generateRandomString, getServersInfos } from '/compiler/utilities'

function removeServer(ns: NS, server: string): void {
	ns.deleteServer(server)
}

function buyServer(ns: NS, ram: number): string {
	const serverName = generateRandomString()
	return ns.purchaseServer(serverName, 2 ** ram)
}

export function main(ns: NS): void {
	const serversData = Array.from(getServersInfos(ns))

	const serversPurchased = serversData.filter(([, server]) => server.purchased)

	if (ns.args[0] === 2 || ns.args[0] === 3 || ns.args[0] === 4 || ns.args[0] === 5 || ns.args[0] === 6) {
		for (const [, server] of serversPurchased) {
			ns.killall(server.hostname)
			removeServer(ns, server.hostname)
		}
	}

	for (let i = 0; i < 25; i += 1) {
		if (ns.args[0] === 1) {
			buyServer(ns, 6)
		} else if (ns.args[0] === 2) {
			buyServer(ns, 9)
		} else if (ns.args[0] === 3) {
			buyServer(ns, 12)
		} else if (ns.args[0] === 4) {
			buyServer(ns, 15)
		} else if (ns.args[0] === 5) {
			buyServer(ns, 18)
		} else {
			buyServer(ns, 20)
		}
	}
}
