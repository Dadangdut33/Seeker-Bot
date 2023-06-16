import { ActivityType } from "discord.js";

interface activityInterface {
	type: ActivityType;
	desc: string;
}

//Type PLAYING WATCHING LISTENING STREAMING COMPETING
export const activity: activityInterface[] = [
	{
		type: ActivityType.Playing,
		desc: "Typescript",
	},
	{
		type: ActivityType.Watching,
		desc: "Bruh moment.mp4",
	},
	{
		type: ActivityType.Watching,
		desc: "Watching You",
	},
	{
		type: ActivityType.Watching,
		desc: "Anime with the homies",
	},
	{
		type: ActivityType.Watching,
		desc: "Seasonal animes",
	},
	{
		type: ActivityType.Watching,
		desc: "coca cola espuma",
	},
	{
		type: ActivityType.Listening,
		desc: "Epic doom ost",
	},
	{
		type: ActivityType.Playing,
		desc: "In the rain..",
	},
	{
		type: ActivityType.Playing,
		desc: "Aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
	},
	{
		type: ActivityType.Playing,
		desc: "With player 2",
	},
	{
		type: ActivityType.Playing,
		desc: "As player 1",
	},
	{
		type: ActivityType.Playing,
		desc: "Running with no problems (I hope)",
	},
	{
		type: ActivityType.Playing,
		desc: "Emus cannot walk backwards, did you know that?",
	},
	{
		type: ActivityType.Playing,
		desc: `Now with slash commands!`,
	},
	{
		type: ActivityType.Playing,
		desc: `Now with discord.js v14!`,
	},
	{
		type: ActivityType.Playing,
		desc: `Did you know that you can search anime using this bot? Well now you do`,
	},
	{
		type: ActivityType.Playing,
		desc: `I wonder how long will this bot last`,
	},
	{
		type: ActivityType.Playing,
		desc: `Running since 2020, with lots of features and... some bugs ?`,
	},
	{
		type: ActivityType.Playing,
		desc: `Secretly spying the outside world...`,
	},
	{
		type: ActivityType.Playing,
		desc: `Star this bot's repo on github`,
	},
	{
		type: ActivityType.Playing,
		desc: `You can find the bot's source code on github`,
	},
];
