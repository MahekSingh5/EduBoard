// Audio/WebRTC Utility Functions

export class AudioManager {
  constructor() {
    this.localStream = null;
    this.mediaRecorder = null;
    this.audioContext = null;
    this.peers = new Map(); // roomId -> { peerId -> { pc, stream } }
  }

  // Get user's microphone stream
  async getAudioStream() {
    try {
      if (this.localStream) {
        return this.localStream;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      this.localStream = stream;
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw new Error('Microphone access denied. Please check your browser settings.');
    }
  }

  // Stop microphone stream
  stopAudioStream() {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
  }

  // Create WebRTC peer connection
  createPeerConnection(config = {}) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
      ],
      ...config,
    });

    return peerConnection;
  }

  // Add local stream to peer connection
  addLocalStreamToPeer(peerConnection, stream) {
    stream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, stream);
    });
  }

  // Create offer for peer
  async createOffer(peerConnection) {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  }

  // Create answer for peer
  async createAnswer(peerConnection) {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
  }

  // Set remote description
  async setRemoteDescription(peerConnection, description) {
    const remoteDescription = new RTCSessionDescription(description);
    await peerConnection.setRemoteDescription(remoteDescription);
  }

  // Add ICE candidate
  async addIceCandidate(peerConnection, candidate) {
    try {
      if (candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }

  // Handle remote stream
  onRemoteStream(peerConnection, callback) {
    peerConnection.ontrack = (event) => {
      console.log('Remote stream received:', event.streams);
      callback(event.streams[0]);
    };
  }

  // Handle ICE candidates
  onIceCandidate(peerConnection, callback) {
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        callback(event.candidate);
      }
    };
  }

  // Monitor connection state
  onConnectionStateChange(peerConnection, callback) {
    peerConnection.onconnectionstatechange = () => {
      callback(peerConnection.connectionState);
    };
  }

  // Close peer connection
  closePeerConnection(peerConnection) {
    if (peerConnection) {
      peerConnection.close();
    }
  }

  // Get connection stats
  async getStats(peerConnection) {
    const stats = await peerConnection.getStats();
    const audioStats = {
      bytesReceived: 0,
      bytesSent: 0,
      packetsLost: 0,
      jitter: 0,
    };

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.mediaType === 'audio') {
        audioStats.bytesReceived = report.bytesReceived;
        audioStats.packetsLost = report.packetsLost;
        audioStats.jitter = report.jitter;
      }
      if (report.type === 'outbound-rtp' && report.mediaType === 'audio') {
        audioStats.bytesSent = report.bytesSent;
      }
    });

    return audioStats;
  }
}

export default new AudioManager();
