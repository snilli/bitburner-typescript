import { NS } from '@ns'
import { ServerInfo } from '/lib/server'

export function main(ns: NS): void {
	const hostName = ''
	const server = new ServerInfo(ns, hostName)
	ns.tprintf(
		`${JSON.stringify(
			{
				money: server.money.available,
				security: server.security.level,
				minSecurity: server.security.min,
			},
			null,
			2,
		)}`,
	)
}
