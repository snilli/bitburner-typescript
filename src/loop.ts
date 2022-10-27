import { NS } from '@ns'

export async function main(ns: NS): Promise<void> {
	const nodeUpdateScore = (node) => {
		node.score = node.cores * 10 + node.ram + node.level
	}
	const sortNode = (a, b) => {
		// return a.level - b.level ||
		// 	a.ram - b.ram ||
		// 	a.cores - b.cores ||
		// 	a.index - b.index
		return a.score - b.score
	}

	while (true) {
		await ns.sleep(50)
		const nodes = []
		let ownNodes = ns.hacknet.numNodes()
		for (let i = 0; i < ownNodes; i++) {
			const node = ns.hacknet.getNodeStats(i)
			node.index = i
			nodeUpdateScore(node)
			nodes.push(node)
		}
		nodes.sort(sortNode)
		const myMoney = ns.getServerMoneyAvailable('home')
		if (ownNodes < ns.hacknet.maxNumNodes() && myMoney > ns.hacknet.getPurchaseNodeCost()) {
			const newNode = ns.hacknet.purchaseNode()
			if (newNode) {
				ownNodes = newNode
				const node = ns.hacknet.getNodeStats(ownNodes)
				node.index = ownNodes
				nodes.unshift(node)
			}
		}
		if (!nodes.length) {
			continue
		}
		const [currentNode] = nodes
		const nodeIndex = currentNode.index

		if (myMoney > ns.hacknet.getCoreUpgradeCost(nodeIndex, 1)) {
			ns.hacknet.upgradeCore(nodeIndex, 1)
			ns.print(`upgrade cores ${currentNode.name}`)
		} else if (myMoney > ns.hacknet.getRamUpgradeCost(nodeIndex, 1)) {
			ns.hacknet.upgradeRam(nodeIndex, 1)
			ns.print(`upgrade ram ${currentNode.name}`)
		} else if (myMoney > ns.hacknet.getLevelUpgradeCost(nodeIndex, 1)) {
			ns.hacknet.upgradeLevel(nodeIndex, 1)
			ns.print(`upgrade level ${currentNode.name}`)
		}
	}
}
