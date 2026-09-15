//#region node_modules/.nitro/vite/services/ssr/assets/image-DYl4nrN-.js
/** Shrink a data-URL so OCR upload stays under the server cap. */
function compressImage(dataUrl, maxEdge = 1280, quality = .72) {
	return new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {
			const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
			const w = Math.max(1, Math.round(img.width * scale));
			const h = Math.max(1, Math.round(img.height * scale));
			const canvas = document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				resolve(dataUrl);
				return;
			}
			ctx.drawImage(img, 0, 0, w, h);
			resolve(canvas.toDataURL("image/jpeg", quality));
		};
		img.onerror = () => resolve(dataUrl);
		img.src = dataUrl;
	});
}
//#endregion
export { compressImage as t };
