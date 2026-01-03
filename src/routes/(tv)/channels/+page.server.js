import { parseDaddy247Channels } from '$lib/utils/parseDaddyHtml';
import { command } from '$app/server';

export async function load({params}){
    const channels = await parseDaddy247Channels();
    return { channels };
}