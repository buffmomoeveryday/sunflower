import { parseDaddy247Channels } from '$lib/utils/parseDaddyHtml';
import { error } from '@sveltejs/kit';


export async function load({ params }) {
	const channels = await parseDaddy247Channels();
	const channel = channels.find((c) => c.channelId === params.channelId);

	if (!channel) {
		throw error(404, 'Channel not found');
	}
	return { channel };
}
