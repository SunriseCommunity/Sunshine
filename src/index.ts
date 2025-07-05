import { config } from "./lib/configs/env"
import { SunshineClient } from "./client"

import "@sapphire/plugin-logger/register"
import "@sapphire/plugin-utilities-store/register"

const client = new SunshineClient()
client.login(config.discord.token)
