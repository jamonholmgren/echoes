import { spawn } from "child_process"

type AudioOptions = {
  volume?: number
  repeat?: boolean
}

export function playAudio(filePath: string, options: AudioOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const afplay = spawn("afplay", [filePath, "-v", (options.volume || 1).toString()], {
      stdio: "ignore",
    })

    afplay.on("close", (code) => {
      if (code !== 0 && code !== null) return reject(`afplay exited with code ${code}`)

      if (options.repeat) return playAudio(filePath, options)
      // to cancel, run `cancelAllAudio()`

      resolve()
    })

    afplay.stderr?.on("data", (data) => {
      console.error(`stderr: ${data}`)
    })
  })
}

export function cancelAllAudio() {
  spawn("killall", ["afplay"])
}
