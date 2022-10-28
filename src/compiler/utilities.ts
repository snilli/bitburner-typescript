import { NS, Player, Server } from '@ns'
import { ServerInfo } from '/lib/server'

/**
 * It generates a random string of 16 characters.
 * @returns A string of 16 random characters.
 */
export function generateRandomString(): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	let result = ''
	for (let i = 0; i < 16; i += 1) {
		result += chars.charAt(Math.floor(Math.random() * chars.length))
	}
	return result
}

export function getAllServer(ns: NS, currentServer = 'home', serverSet = new Set<string>()): Set<string> {
	const serverConnections = ns.scan(currentServer)
	for (const server of serverConnections) {
		if (serverSet.has(server)) {
			continue
		}
		serverSet.add(server)
		getAllServer(ns, server, serverSet)
	}

	return serverSet
}

export function getServersInfos(ns: NS): Map<string, ServerInfo> {
	const serverMap = new Map<string, ServerInfo>()
	for (const [server] of getAllServer(ns).entries()) {
		serverMap.set(server, new ServerInfo(ns, server))
	}

	return serverMap
}

export function findServer(ns: NS, source: string, target: string, servers: string[]): string[] {
	servers.push(source)

	for (const server of ns.scan(source)) {
		if (server === target) {
			servers.push(server)
			return servers
		}

		if (!servers.includes(server)) {
			const route = findServer(ns, server, target, servers.slice())
			if (route[route.length - 1] === target) {
				return route
			}
		}
	}

	return servers
}

/**
 * It calculates the chance of a player hacking a server based on the player's hacking skill, the
 * server's hack difficulty, and the player's hacking chance multiplier
 * @param {Server} server - The server you're hacking
 * @param {Player} player - The player object
 * @returns The chance of hacking a server.
 */
export function calculateHackingChance(server: ServerInfo, player: Player): number {
	const hackFactor = 1.75
	const difficultyMult = (100 - server.security.level) / 100
	const skillMult = hackFactor * player.hacking
	const skillChance = (skillMult - server.hackLevel) / skillMult
	const chance = skillChance * difficultyMult * player.hacking_chance_mult

	if (chance > 1) {
		return 1
	}
	if (chance < 0) {
		return 0
	}

	return chance
}

/**
 * Evaluate if the server can be hacked or not
 * @param {NS} ns - Netscript API
 * @param {Server} server - The server that you're trying to hack.
 * @returns true if player hacking level is higher than the server required skill.
 */
export function canHack(ns: NS, server: Server): boolean {
	return ns.getHackingLevel() >= server.requiredHackingSkill
}

/**
 * It takes the servers data, filters out the servers that are purchased or that are too hard
 * to hack, then it calculates the hacking chance for each server
 * @param {NS} ns - NS
 * @returns The server with the highest hacking chance / max money
 */
export function findBestServerToHack(ns: NS): string {
	const player = ns.getPlayer()
	const serversData = Array.from(getServersInfos(ns))

	const servers = serversData.filter(
		([, server]) => !server.purchased && server.hackLevel <= ns.getHackingLevel() && server.money.max > 0,
	)

	const serverDetails = []

	for (const [, server] of servers) {
		const serverName = server.hostname
		const chance: number =
			Math.round((calculateHackingChance(server, player) * 100 + Number.EPSILON) * 100) / 100
		const maxMoney = server.money.max
		serverDetails.push({
			name: serverName,
			hackingChance: chance,
			money: maxMoney,
		})
	}

	const bestServer = serverDetails.reduce((prev, curr) => {
		if (prev.hackingChance > curr.hackingChance) return prev

		if (prev.hackingChance === curr.hackingChance) {
			if (prev.money > curr.money) {
				return prev
			}
			return curr
		}
		return curr
	})

	return bestServer.name
}
