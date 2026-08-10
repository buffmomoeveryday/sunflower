import { updateWatchProgress, getWatchProgress } from "$lib/remote/bookmarks.remote.js";

const TIME_KEYS = ["currentTime", "time", "position", "seconds", "progress", "played"];
const DURATION_KEYS = ["duration", "runtime", "totalTime", "length", "totalDuration"];
const SEEK_DELAYS_MS = [1000, 3000, 6000];

function tryParseJson(value) {
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}

function getNumericValue(source, keys, seen = new Set()) {
	if (!source || typeof source !== "object" || seen.has(source)) return null;
	seen.add(source);

	for (const key of keys) {
		const value = source[key];
		if (typeof value === "number" && Number.isFinite(value)) return value;
		if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
			return Number(value);
		}
	}

	for (const value of Object.values(source)) {
		const found = getNumericValue(value, keys, seen);
		if (found !== null) return found;
	}

	return null;
}

export function parsePlayerMessage(event) {
	const raw = typeof event?.data === "string" ? tryParseJson(event.data) : event?.data;
	if (!raw || typeof raw !== "object") return null;

	const time = getNumericValue(raw, TIME_KEYS);
	const duration = getNumericValue(raw, DURATION_KEYS);
	if (time === null && duration === null) return null;

	return { time, duration };
}

export function postSeekMessages(iframeEl, seconds) {
	const win = iframeEl?.contentWindow;
	if (!win || !Number.isFinite(seconds) || seconds <= 0) return;

	const commands = [
		{ type: "seek", time: seconds },
		{ type: "seek", currentTime: seconds },
		{ type: "PLAYER_COMMAND", event: "seek", data: { currentTime: seconds } },
		{ event: "seek", currentTime: seconds },
		{ action: "seek", time: seconds },
		{ command: "seek", seconds },
		{ type: "SEEK_TO", value: seconds }
	];

	for (const command of commands) {
		try {
			win.postMessage(command, "*");
		} catch {
			// Cross-origin frames may reject structured clones; ignore.
		}
	}
}

/**
 * Tracks playback position reported by an embedded player and syncs it to the
 * database on a throttled interval. Also restores and best-effort seeks to a
 * saved position when a title/episode loads.
 */
export function createProgressSync({
	type,
	getMeta,
	intervalMs = 10000,
	isEnabled = () => true
}) {
	let position = 0;
	let duration = 0;
	let lastFlushed = -1;
	let intervalId = null;

	async function flush() {
		if (!isEnabled()) return;
		if (!(position > 0)) return;
		if (Math.abs(position - lastFlushed) < 1) return;

		const meta = getMeta() || {};
		if (meta.tmdbId == null) return;

		const snapshot = position;
		lastFlushed = snapshot;

		try {
			await updateWatchProgress({
				type,
				tmdb_id: meta.tmdbId,
				position_seconds: Math.floor(snapshot),
				duration_seconds: duration > 0 ? Math.floor(duration) : undefined,
				season_id: meta.seasonId,
				episode_id: meta.episodeId,
				server_id: meta.serverId
			});
		} catch {
			lastFlushed = -1;
		}
	}

	function handleMessage(event) {
		const parsed = parsePlayerMessage(event);
		if (!parsed) return;
		if (parsed.time !== null && parsed.time >= 0) position = parsed.time;
		if (parsed.duration !== null && parsed.duration > 0) duration = parsed.duration;
	}

	function handleVisibility() {
		if (document.visibilityState === "hidden") flush();
	}

	function scheduleSeek(getIframe, seconds) {
		if (!Number.isFinite(seconds) || seconds <= 0) return;
		for (const delay of SEEK_DELAYS_MS) {
			window.setTimeout(() => postSeekMessages(getIframe?.(), seconds), delay);
		}
	}

	async function loadAndSeek(getIframe) {
		if (!isEnabled()) return 0;
		const meta = getMeta() || {};
		if (meta.tmdbId == null) return 0;

		let saved = null;
		try {
			saved = await getWatchProgress({ type, tmdb_id: meta.tmdbId });
		} catch {
			saved = null;
		}

		if (!saved || !(saved.positionSeconds > 0)) return 0;

		const target = saved.positionSeconds;
		if (saved.durationSeconds && target >= saved.durationSeconds * 0.95) return 0;

		position = target;
		duration = saved.durationSeconds || duration;
		lastFlushed = target;
		scheduleSeek(getIframe, target);
		return target;
	}

	function start() {
		if (typeof window === "undefined") return;
		window.addEventListener("message", handleMessage);
		document.addEventListener("visibilitychange", handleVisibility);
		window.addEventListener("pagehide", flush);
		intervalId = window.setInterval(flush, intervalMs);
	}

	function stop() {
		if (typeof window === "undefined") return;
		window.removeEventListener("message", handleMessage);
		document.removeEventListener("visibilitychange", handleVisibility);
		window.removeEventListener("pagehide", flush);
		if (intervalId) window.clearInterval(intervalId);
		intervalId = null;
		flush();
	}

	function reset() {
		position = 0;
		duration = 0;
		lastFlushed = -1;
	}

	return {
		start,
		stop,
		flush,
		reset,
		loadAndSeek,
		scheduleSeek,
		getPosition: () => position
	};
}
