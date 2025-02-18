import { NS } from '@ns'

/**
 * Given a start, end, and step, return an array of numbers from start to end, counting by step.
 * @param {number} start - The first number in the sequence.
 * @param {number} end - The end of the range.
 * @param {number} [step=1] - The step between each number in the sequence.
 * @returns An array of numbers from start to end, with a step of 1.
 */
function range(start: number, end: number, step = 1): number[] {
	const resMod = step - 1
	const numbers = []
	for (const idx of Array(end - start).keys()) {
		if (idx % step === resMod) {
			numbers.push(idx)
		}
	}

	return numbers
}

/**
 * Calculate the hacknet money rate
 * @param {number} level - The level of the Hnet node.
 * @param {number} ram - The amount of RAM you have.
 * @param {number} cores - number of cores
 * @param {number} mult - The multiplier for the Hnet Money Rate.
 * @returns the rate at which the Hnet Money is being generated.
 */
function calcHnetMoneyRate(level: number, ram: number, cores: number, mult: number): number {
	const levelMult = level * 1.5
	const ramMult = 1.035 ** (ram - 1)
	const coresMult = (cores + 5) / 6
	return levelMult * ramMult * coresMult * mult
}

/**
 * It calculates the median node rate of a list of nodes
 * @param {NS} ns - NS - The namespace of the script.
 * @param {number[]} nodes - An array of node IDs.
 * @returns The median rate of the nodes.
 */
function calcMedianNodeRate(ns: NS, nodes: number[]): number {
	let totalLevel = 0
	let totalRam = 0
	let totalCore = 0
	const nodesNumber: number = ns.hacknet.numNodes()

	for (const node of nodes) {
		const nodeStat = ns.hacknet.getNodeStats(node)
		totalLevel += nodeStat.level
		totalRam += nodeStat.ram
		totalCore += nodeStat.cores
	}

	return calcHnetMoneyRate(
		totalLevel / nodesNumber,
		totalRam / nodesNumber,
		totalCore / nodesNumber,
		ns.getPlayer().mults.hacknet_node_money ?? 0,
	)
}

export async function main(ns: NS): Promise<void> {
	ns.disableLog('sleep')

	// while (totalNodes < 26) {
	while (true) {
		// const totalNodes = ns.hacknet.numNodes()
		const playerMult = ns.getPlayer().mults.hacknet_node_money ?? 0
		const playerMoney = ns.getPlayer().money
		const nodes = range(0, ns.hacknet.numNodes())
		const nodeStats = []

		const nodePurchaseCost = ns.hacknet.getPurchaseNodeCost()
		const nodePurchaseRate = calcMedianNodeRate(ns, nodes)

		nodeStats.push({
			name: 'node',
			cost: nodePurchaseCost,
			ratio: nodePurchaseRate / nodePurchaseCost,
		})

		for (const node of nodes) {
			const { level, ram, cores, production } = ns.hacknet.getNodeStats(node)

			const levelUpgradeCost = ns.hacknet.getLevelUpgradeCost(node, 1)
			const ramUpgradeCost = ns.hacknet.getRamUpgradeCost(node, 1)
			const coreUpgradeCost = ns.hacknet.getCoreUpgradeCost(node, 1)

			const levelUpgradeRate = calcHnetMoneyRate(level + 1, ram, cores, playerMult) - production
			const ramUpgradeRate = calcHnetMoneyRate(level, ram + 1, cores, playerMult) - production
			const coreUpgradeRate = calcHnetMoneyRate(level, ram, cores + 1, playerMult) - production

			nodeStats.push(
				{
					name: 'level',
					core: node,
					cost: levelUpgradeCost,
					ratio: levelUpgradeRate / levelUpgradeCost,
				},
				{
					name: 'ram',
					core: node,
					cost: ramUpgradeCost,
					ratio: ramUpgradeRate / ramUpgradeCost,
				},
				{
					name: 'core',
					core: node,
					cost: coreUpgradeCost,
					ratio: coreUpgradeRate / coreUpgradeCost,
				},
			)
		}

		nodeStats.sort((a, b) => b.ratio - a.ratio)
		const upgrade = nodeStats[0]

		if (upgrade.cost > playerMoney) ns.print('Not enough money for the upgrade (hacknet)!')

		if (upgrade.name === 'level') {
			ns.hacknet.upgradeLevel(upgrade.core as number, 1)
		} else if (upgrade.name === 'ram') {
			ns.hacknet.upgradeRam(upgrade.core as number, 1)
		} else if (upgrade.name === 'core') {
			ns.hacknet.upgradeCore(upgrade.core as number, 1)
		} else if (upgrade.name === 'node') {
			ns.hacknet.purchaseNode()
		}

		await ns.sleep(1)
	}
}
