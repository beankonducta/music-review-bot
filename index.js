import { DiscogsClient } from '@lionralfs/discogs-client';
import OpenAI from 'openai';
import { Client, Events, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });

let discogsClient = new DiscogsClient({
    auth: {
        method: 'discogs',
        consumerKey: process.env.DISCOG_KEY,
        consumerSecret: process.env.DISCOG_SECRET,
    },
});

discordClient.once('ready', async () => {
    let commands = discordClient.application?.commands;

    commands.set([{
        name: 'review',
        description: 'Review an album',
        options: [{
            name: 'artist',
            type: 3,
            description: 'The name of the artist',
            required: true,
        },
        {
            name: 'album',
            type: 3,
            description: 'The name of the album',
            required: true,
        }],
    }]);
});

discordClient.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'review') {
        const artist = interaction.options.getString('artist');
        const album = interaction.options.getString('album');
        // Do something with the artist and album
        // For example, you can send a message with the provided artist and album
        await interaction.deferReply({ ephemeral: true });
        const musicData = await search(artist, album);
        const review = await createReview(musicData);
        const cover = musicData.cover;
        const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(artist.toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' ') + ' - ' + album.toLowerCase()
        .split(' ')
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(' '))
        .setThumbnail(cover)
        .addFields(

            { name: 'Review', value: review },
        )
        .setTimestamp();

        await interaction.editReply({ embeds: [embed]});
    }
});

discordClient.login(process.env.DISCORD_TOKEN);

let artist = "";
let album = "";
let track = "";

const search = async (artist, album, track) => {
    let result = await discogsClient.database().search({ title: album, artist: artist });
    const data = {
        album: result.data.results[0].title,
        year: result.data.results[0].year,
        genre: result.data.results[0].genre,
        style: result.data.results[0].style,
        country: result.data.results[0].country,
        cover: result.data.results[0].cover_image
    }
    return data;
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY
});

async function createReview(musicData) {
    const chatCompletion = await openai.chat.completions.create({
        messages: [{
            role: 'user', content: `
        Write a review of the following album: ${musicData.album}. 
        Please take into consideration the genre, ${musicData.genre} and style, 
        ${musicData.style}. Write in the voice of a pitchfork reviewer. 
        This is a totally fake review, do not use real online reviews. 
        Do not use the word pitchfork. 
        Feel free to make the review positive or negative.
        Keep it to 2-3 sentences and at the end, give it a rounded score between 0 and 10,
        in the format: SCORE: score/10.`
        }],
        model: 'gpt-4-0125-preview',
    });
    return chatCompletion.choices[0].message.content;
}