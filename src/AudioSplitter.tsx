// src/AudioSplitter.tsx
import React, { useRef, useEffect, useState, ChangeEvent } from 'react';

const AudioSplitter: React.FC = () => {
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    const audioContext = useRef<AudioContext>(new AudioContext());
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasWidth = 400;
    const canvasHeight = 200;

    useEffect(() => {
        if (audioBuffer) {
            drawVisualization();
        }
    }, [audioBuffer]);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                try {
                    const buffer = await audioContext.current.decodeAudioData(arrayBuffer);
                    setAudioBuffer(buffer);
                } catch (error) {
                    console.error('Error decoding audio data:', error);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const drawVisualization = () => {
        if (!audioBuffer) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const analyserLeft = audioContext.current.createAnalyser();
        const analyserRight = audioContext.current.createAnalyser();
        const source = audioContext.current.createBufferSource();
        const splitter = audioContext.current.createChannelSplitter(2);

        source.buffer = audioBuffer;
        source.connect(splitter)
        splitter.connect(analyserLeft, 0);
        splitter.connect(analyserRight, 1);
        analyserLeft.connect(audioContext.current.destination);
        analyserRight.connect(audioContext.current.destination);

        source.start();

        const bufferLength = analyserLeft.frequencyBinCount;
        const dataArrayLeft = new Uint8Array(bufferLength);
        const dataArrayRight = new Uint8Array(bufferLength);

        const draw = () => {
            requestAnimationFrame(draw);

            analyserLeft.getByteFrequencyData(dataArrayLeft);
            analyserRight.getByteFrequencyData(dataArrayRight);

            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

            // Calculate average volume for left channel
            const leftVolume = getAverageVolume(dataArrayLeft);
            const leftBarHeight = Math.max(leftVolume, 0); // Ensure the bar height is non-negative

            // Calculate average volume for right channel
            const rightVolume = getAverageVolume(dataArrayRight);
            const rightBarHeight = Math.max(rightVolume, 0); // Ensure the bar height is non-negative

            // Draw left channel bar
            canvasCtx.fillStyle = 'blue';
            canvasCtx.fillRect(50, canvasHeight - leftBarHeight, 50, leftBarHeight);

            // Draw right channel bar
            canvasCtx.fillStyle = 'red';
            canvasCtx.fillRect(canvasWidth - 100, canvasHeight - rightBarHeight, 50, rightBarHeight);
        };

        draw();
    };

    const getAverageVolume = (dataArray: Uint8Array): number => {
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
        }
        return (sum / dataArray.length) * 2; // Scale the volume
    };

    return (
        <div>
            <input
                type="file"
                accept="audio/*"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <canvas ref={canvasRef} />
        </div>
    );
};

export default AudioSplitter;
