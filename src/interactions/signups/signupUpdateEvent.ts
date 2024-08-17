import { ButtonInteraction, Interaction, Message } from 'discord.js';
import { getHydratedSignup } from '../../db/signups';
import { formatSignupEmbed, formatSignupComponents } from '../../views/signup';
import { Event } from '../../builders/event';
export type SignupUpdateEvent =
	| { messageId: string; i: Interaction }
	| { messageId: string; message: Message };

export const onSignupUpdate = new Event<SignupUpdateEvent>().subscribe(
	async (data) => {
		const hydratedSignup = await getHydratedSignup(data.messageId);
		if (!hydratedSignup) return;

		const embed = formatSignupEmbed(hydratedSignup);
		const components = formatSignupComponents(hydratedSignup);

		if ('i' in data) {
			if (data.i.isButton())
				return await data.i.update({
					embeds: [embed],
					components: [components],
				});
			else if (data.i.isChatInputCommand()) {
				return await data.i.editReply({
					embeds: [embed],
					components: [components],
				});
			}
			return;
		}

		await data.message.edit({ embeds: [embed], components: [components] });
	}
);
