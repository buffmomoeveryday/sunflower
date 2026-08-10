<script>
	import { onMount } from "svelte";
	import { Clock, ExternalLink, Play, Radio, Shield } from "lucide-svelte";

	let iframeEl = $state();
	let videoEl = $state();
	let hlsInstance;

	let movieId = $state("550");
	let selectedIframeSource = $state(0);
	let loadedIframeUrl = $state("");
	let iframeProbeResult = $state("Not tested yet.");
	let iframeCurrentTime = $state(null);
	let iframeDuration = $state(null);
	let resumeTime = $state(0);
	let manualResumeTime = $state("");
	let preserveIframeTime = $state(true);
	let seekStatus = $state("No seek attempted yet.");
	let messages = $state([]);
	let hlsUrl = $state("");
	let detectedHlsUrl = $state("");
	let detectedHlsSource = $state("None detected yet.");
	let customPlayerStatus = $state("Enter an authorized HLS URL to test the custom player.");
	let customCurrentTime = $state(0);
	let customDuration = $state(0);

	const iframeProviders = [
		{
			name: "VidSrc ICU",
			buildUrl: (safeMovieId) => `https://vidsrc.icu/embed/movie/${safeMovieId}`
		},
		{
			name: "VidSrc TO",
			buildUrl: (safeMovieId) => `https://vidsrc.to/embed/movie/${safeMovieId}`
		},
		{
			name: "VidSrc CC",
			buildUrl: (safeMovieId) => `https://vidsrc.cc/v2/embed/movie/${safeMovieId}?autoPlay=true`
		},
		{
			name: "Videasy",
			buildUrl: (safeMovieId) => `https://player.videasy.net/movie/${safeMovieId}`
		},
		{
			name: "AutoEmbed",
			buildUrl: (safeMovieId) => `https://player.autoembed.cc/embed/movie/${safeMovieId}`
		},
		{
			name: "111Movies",
			buildUrl: (safeMovieId) => `https://111movies.com/movie/${safeMovieId}`
		},
		{
			name: "VidJoy",
			buildUrl: (safeMovieId) => `https://vidjoy.pro/embed/movie/${safeMovieId}`
		},
		{
			name: "MappleTV",
			buildUrl: (safeMovieId) => `https://mappletv.uk/watch/movie/${safeMovieId}`
		},
		{
			name: "RGShows API 3",
			buildUrl: (safeMovieId) => `https://embed.rgshows.me/api/3/movie/?id=${safeMovieId}`
		},
		{
			name: "VidFast",
			buildUrl: (safeMovieId) => `https://vidfast.pro/movie/${safeMovieId}?autoPlay=true`
		},
		{
			name: "RGShows API 2",
			buildUrl: (safeMovieId) => `https://embed.rgshows.me/api/2/movie/?id=${safeMovieId}`
		}
	];

	const iframeSources = $derived(
		iframeProviders.map((provider) => ({
			name: provider.name,
			url: provider.buildUrl(movieId.trim() || "550")
		}))
	);

	function formatTime(seconds) {
		if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);
		if (hours > 0) {
			return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
		}
		return `${minutes}:${secs.toString().padStart(2, "0")}`;
	}

	function getKnownIframeTime() {
		if (Number.isFinite(iframeCurrentTime) && iframeCurrentTime > 0) return iframeCurrentTime;
		if (Number.isFinite(resumeTime) && resumeTime > 0) return resumeTime;
		return 0;
	}

	function parseTimeInput(value) {
		const trimmed = value.trim();
		if (!trimmed) return null;

		if (/^\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);

		const parts = trimmed.split(":").map((part) => Number(part));
		if (parts.some((part) => !Number.isFinite(part) || part < 0)) return null;

		if (parts.length === 2) return parts[0] * 60 + parts[1];
		if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];

		return null;
	}

	function setManualResumeTime() {
		const parsed = parseTimeInput(manualResumeTime);
		if (parsed === null) {
			seekStatus = "Enter resume time as seconds, mm:ss, or hh:mm:ss.";
			return;
		}

		resumeTime = parsed;
		iframeCurrentTime = parsed;
		seekStatus = `Resume time set to ${formatTime(parsed)}. Switch providers or press seek.`;
	}

	function getNumericValue(source, keys) {
		if (!source || typeof source !== "object") return null;

		for (const key of keys) {
			const value = source[key];
			if (typeof value === "number" && Number.isFinite(value)) return value;
			if (typeof value === "string" && Number.isFinite(Number(value))) return Number(value);
		}

		for (const value of Object.values(source)) {
			const found = getNumericValue(value, keys);
			if (found !== null) return found;
		}

		return null;
	}

	function getStringValue(source, keys) {
		if (!source || typeof source !== "object") return null;

		for (const key of keys) {
			const value = source[key];
			if (typeof value === "string" && value.trim()) return value;
		}

		for (const value of Object.values(source)) {
			const found = getStringValue(value, keys);
			if (found !== null) return found;
		}

		return null;
	}

	function findHlsUrl(source) {
		if (!source) return null;

		if (typeof source === "string") {
			const match = source.match(/https?:\/\/[^\s"'<>\\]+\.m3u8[^\s"'<>\\]*/i);
			return match?.[0] || null;
		}

		if (typeof source !== "object") return null;

		const directValue = getStringValue(source, [
			"hls",
			"hlsUrl",
			"m3u8",
			"m3u8Url",
			"stream",
			"streamUrl",
			"source",
			"src",
			"url"
		]);

		if (directValue?.includes(".m3u8")) return findHlsUrl(directValue);

		for (const value of Object.values(source)) {
			const found = findHlsUrl(value);
			if (found) return found;
		}

		return null;
	}

	function setDetectedHls(url, source) {
		if (!url) return;
		detectedHlsUrl = url;
		detectedHlsSource = source;
	}

	function buildIframeUrlWithTime(url, seconds) {
		if (!Number.isFinite(seconds) || seconds <= 0) return url;

		try {
			const nextUrl = new URL(url);
			const roundedSeconds = Math.floor(seconds);
			nextUrl.searchParams.set("t", String(roundedSeconds));
			nextUrl.searchParams.set("start", String(roundedSeconds));
			nextUrl.searchParams.set("startAt", String(roundedSeconds));
			nextUrl.hash = `t=${roundedSeconds}`;
			return nextUrl.toString();
		} catch {
			return url;
		}
	}

	function loadIframe(options = {}) {
		const keepTime = options.keepTime ?? false;
		const targetTime = keepTime ? getKnownIframeTime() : 0;
		if (keepTime && targetTime > 0) resumeTime = targetTime;

		const baseUrl = iframeSources[selectedIframeSource]?.url || "";
		loadedIframeUrl = keepTime ? buildIframeUrlWithTime(baseUrl, targetTime) : baseUrl;
		iframeProbeResult = "Iframe loaded. Run the probe to test access.";
		iframeCurrentTime = keepTime && targetTime > 0 ? targetTime : null;
		iframeDuration = null;
		seekStatus =
			keepTime && targetTime > 0
				? `Trying to resume near ${formatTime(targetTime)} after the iframe loads.`
				: "No seek attempted yet.";
		messages = [];
	}

	function switchIframeSource(index) {
		if (preserveIframeTime) resumeTime = getKnownIframeTime();
		selectedIframeSource = index;
		loadIframe({ keepTime: preserveIframeTime });
	}

	function probeIframe() {
		try {
			const frameWindow = iframeEl?.contentWindow;
			const frameDocument = frameWindow?.document;
			const nestedVideo = frameDocument?.querySelector("video");
			if (!nestedVideo) {
				iframeProbeResult = "Access succeeded, but no video element was found in the iframe.";
				return;
			}
			iframeCurrentTime = nestedVideo.currentTime;
			iframeDuration = nestedVideo.duration;
			resumeTime = nestedVideo.currentTime;
			setDetectedHls(nestedVideo.currentSrc || nestedVideo.src, "Accessible iframe video element");
			iframeProbeResult = `Access succeeded. Time is ${formatTime(nestedVideo.currentTime)} / ${formatTime(
				nestedVideo.duration
			)}.`;
		} catch (err) {
			iframeProbeResult = `Blocked by the browser: ${err.message}`;
		}
	}

	function handleMessage(event) {
		const payload = typeof event.data === "string" ? event.data : event.data;
		const parsedPayload = typeof payload === "string" ? tryParseJson(payload) : payload;
		const postedTime = getNumericValue(parsedPayload, ["currentTime", "time", "position", "seconds"]);
		const postedDuration = getNumericValue(parsedPayload, ["duration", "runtime", "totalTime", "length"]);
		const postedHlsUrl = findHlsUrl(parsedPayload);

		if (postedTime !== null) iframeCurrentTime = postedTime;
		if (postedTime !== null) resumeTime = postedTime;
		if (postedDuration !== null) iframeDuration = postedDuration;
		setDetectedHls(postedHlsUrl, `postMessage from ${event.origin}`);

		messages = [
			{
				origin: event.origin,
				data: typeof event.data === "string" ? event.data : JSON.stringify(event.data),
				receivedAt: new Date().toLocaleTimeString()
			},
			...messages
		].slice(0, 8);
	}

	function postSeekMessages(seconds) {
		const frameWindow = iframeEl?.contentWindow;
		if (!frameWindow || !Number.isFinite(seconds) || seconds <= 0) return false;

		const commands = [
			{ type: "seek", time: seconds },
			{ type: "seek", currentTime: seconds },
			{ type: "PLAYER_COMMAND", event: "seek", data: { currentTime: seconds } },
			{ event: "seek", currentTime: seconds },
			{ method: "seek", value: seconds },
			{ action: "seek", time: seconds },
			{ command: "seek", seconds },
			{ type: "SEEK_TO", value: seconds },
			{ player: "seek", time: seconds }
		];

		for (const command of commands) {
			frameWindow.postMessage(command, "*");
		}

		return true;
	}

	function tryDirectIframeSeek(seconds) {
		try {
			const frameDocument = iframeEl?.contentWindow?.document;
			const nestedVideo = frameDocument?.querySelector("video");
			if (!nestedVideo) return false;

			nestedVideo.currentTime = seconds;
			iframeCurrentTime = nestedVideo.currentTime;
			iframeDuration = nestedVideo.duration;
			resumeTime = nestedVideo.currentTime;
			return true;
		} catch {
			return false;
		}
	}

	function seekIframeToKnownTime() {
		const targetTime = getKnownIframeTime();
		if (!targetTime) {
			seekStatus = "No known time to resume from yet.";
			return;
		}

		if (tryDirectIframeSeek(targetTime)) {
			seekStatus = `Seeked iframe video directly to ${formatTime(targetTime)}.`;
			return;
		}

		if (postSeekMessages(targetTime)) {
			seekStatus = `Sent common postMessage seek commands for ${formatTime(
				targetTime
			)}. The provider must support one of them.`;
			return;
		}

		seekStatus = "Could not reach the iframe player to seek.";
	}

	function handleIframeLoad() {
		if (!preserveIframeTime || !resumeTime) return;

		window.setTimeout(() => seekIframeToKnownTime(), 1000);
		window.setTimeout(() => seekIframeToKnownTime(), 3000);
		window.setTimeout(() => seekIframeToKnownTime(), 6000);
	}

	function tryParseJson(value) {
		try {
			return JSON.parse(value);
		} catch {
			return value;
		}
	}

	async function loadHlsScript() {
		if (window.Hls) return window.Hls;

		await new Promise((resolve, reject) => {
			const existing = document.querySelector("script[data-hls-js]");
			if (existing) {
				existing.addEventListener("load", resolve, { once: true });
				existing.addEventListener("error", reject, { once: true });
				return;
			}

			const script = document.createElement("script");
			script.src = "https://cdn.jsdelivr.net/npm/hls.js@latest";
			script.async = true;
			script.dataset.hlsJs = "true";
			script.onload = resolve;
			script.onerror = reject;
			document.head.appendChild(script);
		});

		return window.Hls;
	}

	function destroyHls() {
		if (hlsInstance) {
			hlsInstance.destroy();
			hlsInstance = null;
		}
	}

	async function loadCustomPlayer() {
		const streamUrl = hlsUrl.trim();
		destroyHls();

		if (!streamUrl) {
			customPlayerStatus = "Enter an authorized HLS URL.";
			return;
		}

		try {
			setDetectedHls(streamUrl, "Custom player input");
			customPlayerStatus = "Loading custom player.";

			if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
				videoEl.src = streamUrl;
				customPlayerStatus = "Loaded with native HLS support.";
				return;
			}

			const Hls = await loadHlsScript();
			if (!Hls?.isSupported()) {
				customPlayerStatus = "This browser does not support HLS playback.";
				return;
			}

			hlsInstance = new Hls();
			hlsInstance.loadSource(streamUrl);
			hlsInstance.attachMedia(videoEl);
			hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
				customPlayerStatus = "HLS manifest loaded.";
			});
			hlsInstance.on(Hls.Events.ERROR, (_event, data) => {
				if (data?.fatal) customPlayerStatus = data.details || "Fatal HLS playback error.";
			});
		} catch (err) {
			customPlayerStatus = err.message || "Failed to load custom player.";
		}
	}

	function handleCustomTimeUpdate() {
		customCurrentTime = videoEl?.currentTime || 0;
		customDuration = videoEl?.duration || 0;
	}

	onMount(() => {
		window.addEventListener("message", handleMessage);
		loadIframe();

		return () => {
			window.removeEventListener("message", handleMessage);
			destroyHls();
		};
	});
</script>

<svelte:head>
	<title>Stream Test Lab</title>
</svelte:head>

<div class="min-h-screen bg-black text-white">
	<section class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-3 py-4 sm:px-6 lg:px-8">
		<div class="flex flex-col gap-3 border-b border-white/10 pb-5">
			<div class="flex items-center gap-2 text-amber-400">
				<Radio size={20} />
				<span class="text-sm font-semibold uppercase tracking-wide">Stream Test Lab</span>
			</div>
			<h1 class="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
				Test iframe player access and messages
			</h1>
			<p class="max-w-3xl text-sm leading-6 text-gray-400">
				This page tests the same iframe providers used by the movie page and shows whether they expose
				anything useful through direct iframe access or postMessage events.
			</p>
		</div>

		<div class="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
			<section class="rounded-lg border border-white/10 bg-gray-950 p-4">
				<div class="mb-4 flex items-center gap-2">
					<Shield size={18} class="text-amber-400" />
					<h2 class="text-lg font-semibold">Provider iframe probe</h2>
				</div>
				<label class="flex flex-col gap-2 text-sm text-gray-300">
					<span>TMDB movie id</span>
					<input
						bind:value={movieId}
						class="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-white outline-none focus:border-amber-500"
						placeholder="550"
					/>
				</label>
				<div class="mt-3 grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
					{#each iframeSources as source, index}
						<button
							type="button"
							class="flex min-h-12 items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left text-sm transition {selectedIframeSource ===
							index
								? 'border-amber-500 bg-amber-500/15 text-amber-200'
								: 'border-white/10 bg-black text-gray-300 hover:bg-white/10'}"
							onclick={() => switchIframeSource(index)}
						>
							<span class="font-medium">{source.name}</span>
							<span class="truncate text-xs text-gray-500">{source.url}</span>
						</button>
					{/each}
				</div>
				<label class="mt-3 flex items-center gap-3 rounded-lg border border-white/10 bg-black p-3 text-sm text-gray-300">
					<input
						type="checkbox"
						bind:checked={preserveIframeTime}
						class="rounded border-white/20 bg-black text-amber-500 focus:ring-amber-500"
					/>
					<span>Preserve known time when switching iframe providers</span>
				</label>
				<div class="mt-3 grid gap-3 rounded-lg border border-white/10 bg-black p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
					<label class="flex flex-col gap-2 text-sm text-gray-300">
						<span>Manual resume time</span>
						<input
							bind:value={manualResumeTime}
							class="w-full rounded-lg border border-white/10 bg-gray-950 px-3 py-2 text-white outline-none focus:border-amber-500"
							placeholder="0:13 or 13"
						/>
					</label>
					<div class="flex items-end">
						<button
							type="button"
							class="inline-flex min-h-10 items-center rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-black hover:bg-amber-400"
							onclick={setManualResumeTime}
						>
							Set resume time
						</button>
					</div>
				</div>
				<div class="mt-3 flex flex-wrap gap-2">
					<button
						type="button"
						class="inline-flex min-h-10 items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm font-medium text-gray-200 hover:bg-white/10"
						onclick={() => loadIframe({ keepTime: preserveIframeTime })}
					>
						<ExternalLink size={16} />
						Load iframe
					</button>
					<button
						type="button"
						class="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-gray-200"
						onclick={probeIframe}
					>
						Run probe
					</button>
					<button
						type="button"
						class="inline-flex min-h-10 items-center gap-2 rounded-lg border border-amber-500/40 px-3 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/10"
						onclick={seekIframeToKnownTime}
					>
						Seek to known time
					</button>
				</div>
				<p class="mt-3 rounded-lg border border-white/10 bg-black p-3 text-sm text-gray-300">
					{iframeProbeResult}
				</p>
				<div class="mt-3 grid gap-3 text-sm sm:grid-cols-3">
					<div class="rounded-lg border border-white/10 bg-black p-3">
						<p class="text-gray-500">Iframe time</p>
						<p class="mt-1 text-2xl font-bold">{formatTime(iframeCurrentTime)}</p>
					</div>
					<div class="rounded-lg border border-white/10 bg-black p-3">
						<p class="text-gray-500">Iframe runtime</p>
						<p class="mt-1 text-2xl font-bold">{formatTime(iframeDuration)}</p>
					</div>
					<div class="rounded-lg border border-white/10 bg-black p-3">
						<p class="text-gray-500">Resume time</p>
						<p class="mt-1 text-2xl font-bold">{formatTime(resumeTime)}</p>
					</div>
				</div>
				<p class="mt-3 rounded-lg border border-white/10 bg-black p-3 text-sm text-gray-300">
					{seekStatus}
				</p>
				<p class="mt-2 text-xs leading-5 text-gray-500">
					Automatic resume needs provider support. If the iframe timer is visible but the readout is
					blank, type that visible time above before switching.
				</p>
			</section>

			<section class="overflow-hidden rounded-lg border border-white/10 bg-gray-950">
				<div class="aspect-video w-full bg-black">
					{#if loadedIframeUrl}
						<iframe
							bind:this={iframeEl}
							src={loadedIframeUrl}
							title="Cross-origin iframe probe"
							class="h-full w-full"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
							allowfullscreen
							onload={handleIframeLoad}
						></iframe>
					{:else}
						<div class="flex h-full items-center justify-center text-sm text-gray-500">
							Select a provider to load an iframe.
						</div>
					{/if}
				</div>
			</section>
		</div>

		<section class="rounded-lg border border-white/10 bg-gray-950 p-4">
			<div class="mb-4 flex items-center gap-2">
				<Clock size={18} class="text-amber-400" />
				<h2 class="text-lg font-semibold">Custom HTML video player</h2>
			</div>
			<div class="mb-4 rounded-lg border border-white/10 bg-black p-3">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div>
						<p class="text-sm font-semibold text-gray-200">Visible HLS stream</p>
						<p class="mt-1 text-xs text-gray-500">{detectedHlsSource}</p>
					</div>
					<button
						type="button"
						class="inline-flex min-h-9 items-center rounded-lg border border-amber-500/40 px-3 py-2 text-sm font-medium text-amber-200 hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-40"
						disabled={!detectedHlsUrl}
						onclick={() => (hlsUrl = detectedHlsUrl)}
					>
						Use in player
					</button>
				</div>
				<p class="mt-3 break-all rounded-lg border border-white/10 bg-gray-950 p-3 text-xs text-gray-300">
					{detectedHlsUrl || "No .m3u8 URL visible to this page yet."}
				</p>
			</div>
			<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
				<label class="flex flex-col gap-2 text-sm text-gray-300">
					<span>Authorized HLS URL</span>
					<input
						bind:value={hlsUrl}
						class="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-white outline-none focus:border-amber-500"
						placeholder="https://example.com/stream.m3u8"
					/>
				</label>
				<div class="flex items-end">
					<button
						type="button"
						class="inline-flex min-h-10 items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400"
						onclick={loadCustomPlayer}
					>
						<Play size={16} fill="currentColor" />
						Load player
					</button>
				</div>
			</div>
			<div class="mt-4 overflow-hidden rounded-lg border border-white/10 bg-black">
				<div class="aspect-video">
					<video
						bind:this={videoEl}
						class="h-full w-full"
						controls
						playsinline
						onloadedmetadata={handleCustomTimeUpdate}
						ontimeupdate={handleCustomTimeUpdate}
					>
						<track kind="captions" src="/empty-captions.vtt" srclang="en" label="Captions" />
					</video>
				</div>
			</div>
			<div class="mt-3 grid gap-3 text-sm sm:grid-cols-3">
				<div class="rounded-lg border border-white/10 bg-black p-3">
					<p class="text-gray-500">Player time</p>
					<p class="mt-1 text-2xl font-bold">{formatTime(customCurrentTime)}</p>
				</div>
				<div class="rounded-lg border border-white/10 bg-black p-3">
					<p class="text-gray-500">Player runtime</p>
					<p class="mt-1 text-2xl font-bold">{formatTime(customDuration)}</p>
				</div>
				<div class="rounded-lg border border-white/10 bg-black p-3">
					<p class="text-gray-500">Status</p>
					<p class="mt-2 text-sm text-gray-300">{customPlayerStatus}</p>
				</div>
			</div>
		</section>

		<section class="rounded-lg border border-white/10 bg-gray-950 p-4">
			<h2 class="text-lg font-semibold">postMessage events</h2>
			{#if messages.length === 0}
				<p class="mt-2 text-sm text-gray-500">No iframe messages received yet.</p>
			{:else}
				<div class="mt-3 grid gap-2">
					{#each messages as message}
						<div class="rounded-lg border border-white/10 bg-black p-3 text-sm">
							<div class="flex flex-wrap items-center justify-between gap-2 text-gray-500">
								<span>{message.origin}</span>
								<span>{message.receivedAt}</span>
							</div>
							<p class="mt-2 break-words text-gray-300">{message.data}</p>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	</section>
</div>
