import { NS, Server } from '@ns'

interface ServerPorts {
	required: number
	open: number
	ftp: boolean
	http: boolean
	smtp: boolean
	sql: boolean
	ssh: boolean
}

interface ServerProgram {
	ftp: boolean
	http: boolean
	smtp: boolean
	sql: boolean
	ssh: boolean
	available: number
}

interface ServerRam {
	used: number
	max: number
	free: number
}

interface ServerSecurity {
	level: number
	base: number
	min: number
}

interface ServerMoney {
	available: number
	max: number
	growth: number
}

const reservedRam = 10

export class ServerInfo {
	constructor(private ns: NS, public host: string) {
		this.ns = ns
		this.host = host
	}

	get data(): Server {
		return this.ns.getServer(this.host)
	}
	get programs(): ServerProgram {
		const program = {
			ftp: false,
			http: false,
			smtp: false,
			sql: false,
			ssh: false,
			available: 0,
		}
		if (this.ns.fileExists('FTPCrack.exe')) {
			program.ftp = true
			program.available += 1
		}
		if (this.ns.fileExists('HTTPWorm.exe')) {
			program.http = true
			program.available += 1
		}
		if (this.ns.fileExists('relaySMTP.exe')) {
			program.smtp = true
			program.available += 1
		}
		if (this.ns.fileExists('SQLInject.exe')) {
			program.sql = true
			program.available += 1
		}
		if (this.ns.fileExists('BruteSSH.exe')) {
			program.ssh = true
			program.available += 1
		}

		return program
	}
	get admin(): boolean {
		return this.data.hasAdminRights
	}
	get hostname(): string {
		return this.data.hostname
	}
	get ip(): string {
		return this.data.ip
	}
	get cores(): number {
		return this.data.cpuCores
	}
	get organization(): string {
		return this.data.organizationName
	}
	get connected(): boolean {
		return this.data.isConnectedTo
	}
	get backdoor(): boolean {
		return this.data.backdoorInstalled
	}
	get logRam(): number {
		return Math.max(0, Math.log2(this.data.maxRam))
	}
	get purchased(): boolean {
		return this.data.purchasedByPlayer && this.data.hostname !== 'home'
	}
	get hackLevel(): number {
		return this.data.requiredHackingSkill
	}

	get ports(): ServerPorts {
		return {
			required: this.data.numOpenPortsRequired,
			open: this.data.openPortCount,
			ftp: this.data.ftpPortOpen,
			http: this.data.httpPortOpen,
			smtp: this.data.smtpPortOpen,
			sql: this.data.sqlPortOpen,
			ssh: this.data.sshPortOpen,
		}
	}

	get ram(): ServerRam {
		return {
			used: this.data.ramUsed,
			max: this.data.maxRam - (this.data.hostname === 'home' ? reservedRam : 0),
			free: this.data.maxRam - this.data.ramUsed - (this.data.hostname === 'home' ? reservedRam : 0),
		}
	}

	get security(): ServerSecurity {
		return {
			level: this.data.hackDifficulty,
			base: this.data.baseDifficulty,
			min: this.data.minDifficulty,
		}
	}

	get money(): ServerMoney {
		return {
			available: this.data.moneyAvailable,
			max: this.data.moneyMax,
			growth: this.data.serverGrowth,
		}
	}

	calculateThreadCount(scriptRamUsage: number): number {
		return Math.floor(this.ram.free / scriptRamUsage)
	}

	penetrate(): boolean {
		try {
			const ports = this.ports
			const programs = this.programs
			if (programs.available < ports.open) {
				return false
			}

			if (programs.ftp && !ports.ftp) {
				this.ns.ftpcrack(this.hostname)
			}
			if (programs.ssh && !ports.ssh) {
				this.ns.brutessh(this.hostname)
			}
			if (programs.smtp && !ports.smtp) {
				this.ns.relaysmtp(this.hostname)
			}
			if (programs.http && !ports.http) {
				this.ns.httpworm(this.hostname)
			}
			if (programs.sql && !ports.sql) {
				this.ns.sqlinject(this.hostname)
			}

			this.ns.nuke(this.hostname)

			return true
		} catch (e) {
			this.ns.print(e)
			return false
		}
	}
}
