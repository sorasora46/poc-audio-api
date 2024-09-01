import React, { useEffect, useRef, useState } from 'react';

const AudioDecibelMeter: React.FC = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const [leftVolume, setLeftVolume] = useState<number>(0);
    const [rightVolume, setRightVolume] = useState<number>(0);
    const audioElementRef = useRef<HTMLMediaElement | null>(null);

    useEffect(() => {
        audioElementRef.current = new Audio('assets/sound.webm');
        // audioElement.crossOrigin = "anonymous"; // Set this if your audio is hosted externally

        return () => {
            scriptProcessorRef.current?.disconnect();
            audioContextRef.current?.close();
        };
    }, []);

    const handleClick = () => {
        audioContextRef.current = new AudioContext();

        if (audioContextRef.current && audioElementRef.current) {
            const source = audioContextRef.current.createMediaElementSource(audioElementRef.current);

            const analyserLeft = audioContextRef.current.createAnalyser();
            const analyserRight = audioContextRef.current.createAnalyser();

            const splitter = audioContextRef.current.createChannelSplitter(2);
            source.connect(splitter);

            splitter.connect(analyserLeft, 0);
            splitter.connect(analyserRight, 1);

            scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(2048, 2, 2);

            scriptProcessorRef.current.onaudioprocess = () => {
                const leftData = new Uint8Array(analyserLeft.frequencyBinCount);
                const rightData = new Uint8Array(analyserRight.frequencyBinCount);

                analyserLeft.getByteFrequencyData(leftData);
                analyserRight.getByteFrequencyData(rightData);

                const leftRms = Math.sqrt(leftData.reduce((sum, val) => sum + val * val, 0) / leftData.length);
                const rightRms = Math.sqrt(rightData.reduce((sum, val) => sum + val * val, 0) / rightData.length);

                const leftDecibel = 20 * Math.log10(leftRms / 255);
                const rightDecibel = 20 * Math.log10(rightRms / 255);

                setLeftVolume(parseFloat(leftDecibel.toFixed(2)));
                setRightVolume(parseFloat(rightDecibel.toFixed(2)));
            };

            splitter.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(audioContextRef.current.destination);

            audioElementRef.current.play();
        }
    }

    return (
        <div>
            <button onClick={handleClick}>play</button>
            <h1>Audio Decibel Meter</h1>
            <div>
                <strong>Left Channel Volume:</strong> {leftVolume} dB
            </div>
            <div>
                <strong>Right Channel Volume:</strong> {rightVolume} dB
            </div>
        </div>
    );
};

export default AudioDecibelMeter;
