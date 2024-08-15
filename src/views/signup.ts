import {
	EmbedBuilder,
	Colors,
	RestOrArray,
	APIEmbedField,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} from 'discord.js';
import { HydratedSignup } from '../db/signups';
import { categoryJoinButton } from '../interactions/signups/buttons/categoryJoin';
import { createCustomId } from '../utils/customId';
import { leaveCategoryBtn } from '../interactions/signups/buttons/categoryLeave';

export function formatSignupEmbed(signup: HydratedSignup) {
	const embed = new EmbedBuilder();
	embed.setTitle(signup.name);
	embed.setDescription('Click the appropriate buttons to join a category');
	embed.setColor(Colors.Blurple);

	const hoistedFields: RestOrArray<APIEmbedField> = [];
	const otherFields: RestOrArray<APIEmbedField> = [];

	for (const category of signup.categories) {
		const users_str: string[] = [];
		for (const user of category.users) {
			const illegal_chars = ['*', '_', '~'];
			let does_contain = false;
			for (const char of illegal_chars) {
				if (user.username.includes(char)) {
					does_contain = true;
					break;
				}
			}

			if (does_contain) users_str.push(`> \`${user.username}\``);
			else users_str.push(`> ${user.username}`);
		}
		if (users_str.length === 0) users_str.push('> None');

		const field = {
			name: category.name,
			value: users_str.join('\n'),
			inline: true,
		};

		if (category.isHoisted) hoistedFields.push(field);
		else otherFields.push(field);
	}

	embed.addFields(hoistedFields);
	embed.addFields({
		name: '\u200B',
		value: '**__[ SIGNED UP ]__**',
	});
	embed.addFields(otherFields);

	return embed;
}

export function formatSignupComponents(signup: HydratedSignup) {
	const row = new ActionRowBuilder<ButtonBuilder>();

	const buttons: ButtonBuilder[] = [];

	signup.categories.forEach((category) => {
		if (category.isHoisted) return;
		const btn = new ButtonBuilder();
		const customId = createCustomId('signup-join', category.id.toString());
		btn.setCustomId(customId);
		btn.setLabel(category.buttonName ?? category.name);
		btn.setStyle(
			category.isFocused ? ButtonStyle.Primary : ButtonStyle.Secondary
		);
		buttons.push(btn);
	});

	row.setComponents(buttons);
	row.addComponents(leaveCategoryBtn.build());
	return row;
}
