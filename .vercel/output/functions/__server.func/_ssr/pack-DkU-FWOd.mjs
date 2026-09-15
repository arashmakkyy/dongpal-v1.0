//#region node_modules/.nitro/vite/services/ssr/assets/pack-DkU-FWOd.js
function toB64url(bytes) {
	let bin = "";
	const chunk = 32768;
	for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
	return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s) {
	const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - s.length % 4);
	const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
	const bytes = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
	return bytes;
}
function encodePack(pack) {
	const slim = {
		v: 1,
		gathering: {
			...pack.gathering,
			archived: false
		},
		people: pack.people.map((p) => ({
			...p,
			isMe: false,
			avatar: p.avatar.startsWith("data:") ? "" : p.avatar
		})),
		expenses: pack.expenses.map((e) => ({
			...e,
			receiptImage: void 0
		}))
	};
	const json = JSON.stringify(slim);
	return toB64url(new TextEncoder().encode(json));
}
function decodePack(raw) {
	try {
		const json = new TextDecoder().decode(fromB64url(raw.trim()));
		const data = JSON.parse(json);
		if (!data || data.v !== 1 || !data.gathering?.name) return null;
		if (!Array.isArray(data.people) || !Array.isArray(data.expenses)) return null;
		return data;
	} catch {
		return null;
	}
}
function packFromState(gathering, people, expenses) {
	const members = people.filter((p) => gathering.memberIds.includes(p.id));
	const hostTag = `h-${gathering.id.replace(/[^a-z0-9]/gi, "").slice(-8) || "host"}`;
	const idMap = /* @__PURE__ */ new Map();
	const packedPeople = members.map((p) => {
		const id = p.isMe || p.id === "me" ? hostTag : p.id;
		idMap.set(p.id, id);
		return {
			...p,
			id,
			isMe: false,
			avatar: p.avatar.startsWith("data:") ? "" : p.avatar
		};
	});
	const mappedIds = gathering.memberIds.map((id) => idMap.get(id) ?? id);
	const packedExpenses = expenses.filter((e) => e.gatheringId === gathering.id).map((e) => {
		const shares = e.shares ? Object.fromEntries(Object.entries(e.shares).map(([k, v]) => [idMap.get(k) ?? k, v])) : void 0;
		return {
			...e,
			payerId: idMap.get(e.payerId) ?? e.payerId,
			participantIds: e.participantIds.map((id) => idMap.get(id) ?? id),
			shares,
			receiptImage: void 0
		};
	});
	return {
		v: 1,
		gathering: {
			...gathering,
			memberIds: mappedIds,
			archived: false
		},
		people: packedPeople,
		expenses: packedExpenses
	};
}
function joinUrl(encoded) {
	return `${typeof window !== "undefined" ? window.location.origin : ""}/join#${encoded}`;
}
function readJoinHash(hash = "") {
	return hash.startsWith("#") ? hash.slice(1) : hash;
}
//#endregion
export { readJoinHash as a, packFromState as i, encodePack as n, joinUrl as r, decodePack as t };
