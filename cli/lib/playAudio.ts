import { spawn } from "child_process"

type AudioOptions = {
  volume?: number
  repeat?: boolean
}

const audioPath = `${__dirname}/../audio`
const _audioFiles = {
  footstep: "footstep.wav",
  music: "music-01.wav",
} as const

export function playAudio(name: keyof typeof _audioFiles, options: AudioOptions = {}): Promise<void> {
  return playAudioFile(`${audioPath}/${_audioFiles[name]}`, options)
}

export function playAudioFile(filePath: string, options: AudioOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const afplay = spawn("afplay", [filePath, "-v", (options.volume || 1).toString()], {
      stdio: "ignore",
    })

    afplay.on("close", (code) => {
      if (code !== 0 && code !== null) return reject(`afplay exited with code ${code}`)

      if (options.repeat) return playAudioFile(filePath, options)
      // to cancel, run `cancelAllAudio()`

      resolve()
    })

    afplay.stderr?.on("data", (data) => {
      throw new Error(`afplay error: ${data}`)
    })
  })
}

export function cancelAllAudio() {
  spawn("killall", ["afplay"])
}
