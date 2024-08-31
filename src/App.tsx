import React from "react"

function App() {
  const [audio] = React.useState(new Audio("public/assets/sound.webm"))
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false)
  const [currentTime, setCurrentTime] = React.useState<number>(0)
  const [currentVolume, setCurrentVolume] = React.useState<number>(0)

  const handleTogglePlayAudio = () => {
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play()
      setIsPlaying(true)
    }
  }

  const handleResetAudio = () => {
    audio.load()
  }

  const getFormatDuration = (time: number) => {
    const mins = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds;
    return `${mins}:${formattedSeconds}`
  }

  const handleIncreaseVolume = () => {
    setCurrentVolume((prevVolume) => {
      const newVolume = Math.min(prevVolume + 0.1, 1) // Increase by 0.1 and clamp to max 1
      audio.volume = newVolume
      return newVolume
    })
  }

  const handleDecreaseVolume = () => {
    setCurrentVolume((prevVolume) => {
      const newVolume = Math.max(prevVolume - 0.1, 0) // Decrease by 0.1 and clamp to min 0
      audio.volume = newVolume
      return newVolume
    })
  }

  React.useEffect(() => {
    const updateCurrentTime = () => {
      setCurrentTime(audio.currentTime)
    }

    const updateCurrentVolume = () => {
      setCurrentVolume(audio.volume)
    }

    audio.addEventListener('timeupdate', updateCurrentTime);

    audio.addEventListener('volumechange', updateCurrentVolume);

    return () => {
      audio.removeEventListener('timeupdate', updateCurrentTime);
      audio.removeEventListener('volumechange', updateCurrentVolume)
    }
  }, [audio])

  return (
    <>
      <div className="container">
        <div className="box">
          <p>{getFormatDuration(currentTime)}/{getFormatDuration(audio.duration)}</p>
          <p>volume: {currentVolume}</p>
          <button onClick={handleIncreaseVolume}>increase volume</button>
          <button onClick={handleDecreaseVolume}>decrease volume</button>
          <button onClick={handleTogglePlayAudio}>
            {isPlaying ? "pause" : "play"}
          </button>
          <button onClick={handleResetAudio}>reset</button>
          <p>audio duration: {audio.duration} seconds</p>
        </div>
      </div>
    </>
  )
}

export default App
