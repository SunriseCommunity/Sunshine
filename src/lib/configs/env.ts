import path from "path"

export interface IConfig {
  discord: {
    token: string
  }
  ids: {
    newScoresChannel: string | undefined
  }
  sunrise: {
    uri: string
  }
  environment: "prod" | "dev"
  json: {
    emojis: {
      ranks: {
        F: string
        S: string
        D: string
        C: string
        B: string
        A: string
        X: string
        XH: string
        SH: string
      }
      countSlidersIcon: string
      countCirclesIcon: string
      bpmIcon: string
      totalLengthIcon: string
      rankedStatus: string
    }
  }
}

const requiredEnvVariables = ["DISCORD_TOKEN", "SUNRISE_URI"]
requiredEnvVariables.map((v) => {
  if (!process.env[v]) {
    throw new Error(`${v} is not provided in environment file!`)
  }
})

export const config: IConfig = {
  discord: {
    token: process.env["DISCORD_TOKEN"]!,
  },
  sunrise: {
    uri: process.env["SUNRISE_URI"]!,
  },
  ids: {
    newScoresChannel: process.env["NEW_SCORES_CHANNED_ID"] ?? undefined,
  },
  environment: ["prod", "dev"].includes(process.env.NODE_ENV ?? "")
    ? (process.env.NODE_ENV as any)
    : "dev",
  json: require(path.resolve(process.cwd(), "config", `${process.env.NODE_ENV ?? "dev"}.json`)),
}
