import { parse } from 'node-html-parser';

export async function parseDaddy247Channels() {
	const daddy247Channel = 'https://daddyhd.com/24-7-channels.php';
	try {
		const res = await fetch(daddy247Channel);
		const html = await res.text();
		const root = parse(html);
		const cards = root.querySelectorAll('.grid .card');

		return cards.map((card) => ({
			channelId:`${card.getAttribute('href').split('id=')[1]}`,
			daddyLink: `https://daddyhd.com${card.getAttribute('href')}`,
            embedLink: {
                "player1": `<iframe src="https://daddyhd.com/stream/stream-${card.getAttribute('href').split('id=')[1]}.php" width="100%" height="100%" style="border:0;" allowfullscreen></iframe>`,
                "player2":`<iframe src="https://daddyhd.com/cast/stream-${card.getAttribute('href').split('id=')[1]}.php" width="100%" height="100%" style="border:0;" allowfullscreen></iframe>`,
                "player3":`<iframe src="https://daddyhd.com/watch/stream-${card.getAttribute('href').split('id=')[1]}.php" width="100%" height="100%" style="border:0;" allowfullscreen></iframe>`,
                "player4":`<iframe src="https://daddyhd.com/plus/stream-${card.getAttribute('href').split('id=')[1]}.php" width="100%" height="100%" style="border:0;" allowfullscreen></iframe>`,
                "player5":`<iframe src="https://daddyhd.com/casting/stream-${card.getAttribute('href').split('id=')[1]}.php" width="100%" height="100%" style="border:0;" allowfullscreen></iframe>`
            },
            title: card.querySelector('.card__title')?.text.trim() || 'Unknown'
		}));
	} catch (error) {
		console.error('Error fetching or parsing DaddyHD channels:', error);
		return [];
	}
}



export async function parseDaddySchedule() {
	const daddyUrl = 'https://daddyhd.com/';
	try {
		const res = await fetch(daddyUrl);
		const html = await res.text();
		const root = parse(html);

		const categories = root.querySelectorAll('.schedule__category');

		return categories.map((cat) => ({
			category: cat.querySelector('.card__meta')?.text.trim() || 'Unknown',
			events: cat.querySelectorAll('.schedule__event').map((event) => ({
				time: event.querySelector('.schedule__time')?.getAttribute('data-time'),
				displayTime: event.querySelector('.schedule__time')?.text.trim(),
				title: event.querySelector('.schedule__eventTitle')?.text.trim(),
				channels: event.querySelectorAll('.schedule__channels a').map((ch) => ({
					name: ch.text.trim(),
					href: ch.getAttribute('href'),
					channelId: ch.getAttribute('href')?.split('id=')[1]
				}))
			}))

		}));
	} catch (error) {
		console.error('Error fetching or parsing DaddyHD schedule:', error);
		return [];
	}
}