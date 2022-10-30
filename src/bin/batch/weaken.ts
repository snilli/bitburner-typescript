import { NS } from '@ns'

const runtimeMultiplier = 4.0

export async function main(ns: NS): Promise<void> {
	const host = ns.args[0].toString()
	const batchLand = Number(ns.args[1])

	if (batchLand) {
		const runtime = runtimeMultiplier * ns.getHackTime(host)
		const currentTime = performance.now()
		await ns.sleep(batchLand - currentTime - runtime)
	}

	await ns.weaken(host)
}
