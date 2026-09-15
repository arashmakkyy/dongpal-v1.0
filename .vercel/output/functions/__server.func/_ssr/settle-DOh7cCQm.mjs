//#region node_modules/.nitro/vite/services/ssr/assets/settle-DOh7cCQm.js
function allocate(amount, ids, percents) {
	const n = ids.length;
	const out = {};
	if (n === 0) return out;
	if (!percents) {
		const base = Math.floor(amount / n);
		let rem = amount - base * n;
		ids.forEach((id) => {
			out[id] = base + (rem > 0 ? 1 : 0);
			if (rem > 0) rem -= 1;
		});
		return out;
	}
	let used = 0;
	ids.forEach((id, i) => {
		if (i === ids.length - 1) out[id] = Math.max(0, amount - used);
		else {
			const v = Math.round(amount * (percents[id] ?? 0) / 100);
			out[id] = v;
			used += v;
		}
	});
	return out;
}
/** Integer percents that always sum to 100. */
function equalPercents(ids) {
	const n = ids.length;
	const out = {};
	if (n === 0) return out;
	if (n === 1) return { [ids[0]]: 100 };
	const base = Math.floor(100 / n);
	let rem = 100 - base * n;
	for (const id of ids) {
		out[id] = base + (rem > 0 ? 1 : 0);
		if (rem > 0) rem -= 1;
	}
	return out;
}
function sharesSum(shares, ids) {
	return ids.reduce((s, id) => s + (shares[id] ?? 0), 0);
}
function percentFromAmount(amount, total) {
	if (total <= 0) return 0;
	return Math.max(0, Math.min(100, Math.round(amount / total * 100)));
}
/**
* Dragging one person to `newPercent` keeps the total at 100.
* Remaining is split among the others using `weights` (usually their
* shares at the start of the drag). If everyone else is at 0, remaining
* is split equally. Integers via largest-remainder so they always add up.
*/
function redistributeShares(ids, changedId, newPercent, weights) {
	if (ids.length === 0) return {};
	if (!ids.includes(changedId)) return Object.fromEntries(ids.map((id) => [id, weights[id] ?? 0]));
	if (ids.length === 1) return { [changedId]: 100 };
	const changed = Math.max(0, Math.min(100, Math.round(newPercent)));
	const others = ids.filter((id) => id !== changedId);
	const remaining = 100 - changed;
	const w = others.map((id) => Math.max(0, weights[id] ?? 0));
	const wSum = w.reduce((a, b) => a + b, 0);
	const raw = wSum > 0 ? w.map((wi) => remaining * wi / wSum) : others.map(() => remaining / others.length);
	const floors = raw.map((x) => Math.floor(x + 1e-9));
	let leftover = remaining - floors.reduce((a, b) => a + b, 0);
	const order = raw.map((x, i) => ({
		i,
		frac: x - Math.floor(x + 1e-9)
	})).sort((a, b) => b.frac - a.frac || a.i - b.i);
	const out = { [changedId]: changed };
	floors.forEach((f, i) => {
		out[others[i]] = f;
	});
	for (let k = 0; leftover > 0 && k < order.length; k += 1) {
		out[others[order[k].i]] += 1;
		leftover -= 1;
	}
	while (leftover < 0) {
		const idx = floors.findIndex((f) => f > 0);
		if (idx < 0) break;
		out[others[idx]] -= 1;
		leftover += 1;
	}
	return out;
}
function nets(memberIds, expenses) {
	const net = {};
	for (const id of memberIds) net[id] = 0;
	for (const e of expenses) {
		const parts = e.participantIds.filter((id) => id in net);
		if (parts.length === 0) continue;
		const shares = allocate(e.amount, parts, e.split === "unequal" ? e.shares : void 0);
		if (e.payerId in net) net[e.payerId] += e.amount;
		for (const [id, amt] of Object.entries(shares)) if (id in net) net[id] -= amt;
	}
	for (const id of Object.keys(net)) net[id] = Math.round(net[id]);
	return net;
}
function minimizeTransfers(net) {
	const debtors = Object.entries(net).filter(([, v]) => v < -1).map(([id, v]) => ({
		id,
		amt: -v
	})).sort((a, b) => b.amt - a.amt);
	const creditors = Object.entries(net).filter(([, v]) => v > 1).map(([id, v]) => ({
		id,
		amt: v
	})).sort((a, b) => b.amt - a.amt);
	const res = [];
	let i = 0;
	let j = 0;
	while (i < debtors.length && j < creditors.length) {
		const pay = Math.min(debtors[i].amt, creditors[j].amt);
		const amount = Math.round(pay);
		if (amount > 0) res.push({
			fromId: debtors[i].id,
			toId: creditors[j].id,
			amount
		});
		debtors[i].amt -= pay;
		creditors[j].amt -= pay;
		if (debtors[i].amt < 1) i += 1;
		if (creditors[j].amt < 1) j += 1;
	}
	return res;
}
function gatheringTotal(expenses) {
	return expenses.reduce((s, e) => s + e.amount, 0);
}
//#endregion
export { nets as a, sharesSum as c, minimizeTransfers as i, equalPercents as n, percentFromAmount as o, gatheringTotal as r, redistributeShares as s, allocate as t };
