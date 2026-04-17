import { useEffect, useRef } from 'react';

export default function AudioOutput({ stream, userId, userName }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && stream) {
      audioRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      className="hidden"
      data-user-id={userId}
      data-user-name={userName}
    />
  );
}
