import { useRef, useState } from "react"
import AudioDecibelMeter from "./AudioDecibelMeter";

function App() {
  const audioContext = useRef<AudioContext | null>(null)
  const audioElement = useRef<HTMLMediaElement | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const [leftVolume, setLeftVolume] = useState<number>(0);
  const [rightVolume, setRightVolume] = useState<number>(0);

  const handlePlayAudio = () => {
    console.log('played')
    audioContext.current = new AudioContext()

    if (audioElement.current) {
      const audioSource = audioContext.current.createMediaElementSource(audioElement.current)
      const analyzerLeft = audioContext.current.createAnalyser()
      const analyzerRight = audioContext.current.createAnalyser()
      const splitter = audioContext.current.createChannelSplitter(2)
      audioSource.connect(splitter)

      splitter.connect(analyzerLeft, 0)
      splitter.connect(analyzerRight, 1)

      scriptProcessorRef.current = audioContext.current.createScriptProcessor(2048, 2, 2);

      scriptProcessorRef.current.onaudioprocess = () => {
        const leftData = new Uint8Array(analyzerLeft.frequencyBinCount)
        const rightData = new Uint8Array(analyzerRight.frequencyBinCount)

        analyzerLeft.getByteFrequencyData(leftData)
        analyzerRight.getByteFrequencyData(rightData)

        const leftRms = Math.sqrt(leftData.reduce((sum, val) => sum + val * val, 0) / leftData.length)
        const rightRms = Math.sqrt(rightData.reduce((sum, val) => sum + val * val, 0) / rightData.length)

        const leftDecibel = Math.abs(20 * Math.log10(leftRms / 255))
        const rightDecibel = Math.abs(20 * Math.log10(rightRms / 255))

        setLeftVolume(parseFloat(leftDecibel.toFixed(2)))
        setRightVolume(parseFloat(rightDecibel.toFixed(2)))
      }

      splitter.connect(scriptProcessorRef.current)
      scriptProcessorRef.current.connect(audioContext.current.destination)
    }
  }

  const getFormattedVolume = (volume: number) => {
    return volume == Number.POSITIVE_INFINITY ? 0 : volume
  }

  return (
    <>
      <div className="container">
        {/* <AudioDecibelMeter /> */}
        <div className="box">
          <p>{getFormattedVolume(leftVolume)} dB</p>
          <p>{getFormattedVolume(rightVolume)} dB</p>
          <audio ref={audioElement} onPlay={handlePlayAudio} src="assets/sound.webm" controls></audio>
        </div>
      </div>
    </>
  )
}

export default App
