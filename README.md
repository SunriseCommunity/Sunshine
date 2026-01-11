# 🌻 Sunshine - Discord Bot for the Sunrise server

![462894956-551fc5b1-2f73-4792-9284-2c2f3452e42b](https://github.com/user-attachments/assets/1dbddcfa-1b08-4a04-8f64-bfbe8c5dcc45)

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/SunriseCommunity/Sunshine.svg?style=social&label=Star)](https://github.com/SunriseCommunity/Sunshine)

## Description

This is a Discord Bot build with [Sapphire framework](https://sapphirejs.dev/), [Bun](https://bun.sh/) and [TypeScript](https://www.typescriptlang.org/). 

It is a part of the Sunrise project, which aims to create a fully functional osu! private server with all the features that the official server has. 

This project also has **automated testing** setup with GitHub Actions! ✨

## Preview 🖼️

![New Project (3)](https://github.com/user-attachments/assets/5cba5334-3455-4a56-aa9a-8930bb16abfd)


## Installation (with docker) 🐳
1. Clone the repository
2. Create copy of `.env.example` file as `.env` and fill all required fields
3. Update `config/prod.json` with you own emojis ids (You can find needed files in `data/emojis`)
4. Run the following command to create docker container:
```bash
docker compose up -d
```
5. Bot should be now up and running!

## Installation 📩

1. Clone the repository
2. Install the required dependencies: `bun install`
3. Update `config/dev.json` with you own emojis ids (You can find needed files in `data/emojis`)
4. Create copy of `.env.example` file as `.env` and fill all required fields
5. Start the application with `bun run start` or `bun run dev`

## Contributing 💖

If you want to contribute to the project, feel free to fork the repository and submit a pull request. We are open to any
suggestions and improvements.



