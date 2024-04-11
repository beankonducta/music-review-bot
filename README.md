# Discord music review bot

## Uses Discogs api to pull music data and Openai for writing reviews.

Usage (in Discord):
`/review the fall of troy manipulator`

## Instructions:

Clone the repo. Navigate to the cloned directory and run:
`npm install`

Create a .env file in the directory and add these variables:
```
DISCOG_KEY=xx
DISCOG_SECRET=xx
DISCORD_TOKEN=xx
OPENAI_KEY=xx
```

To run locally for testing, use `node index.js` in that directory.

For more info on creating a Discord bot, please see [this link](https://discord.com/developers/docs/intro).