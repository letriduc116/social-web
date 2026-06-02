import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Avatar } from '@mui/material';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import VideocamOffRoundedIcon from '@mui/icons-material/VideocamOffRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import type { ChatCallSignal, ChatConversation } from '../types/chat';
import { ChatCallContext } from '../hook/useChatCall';
import { sendChatCallSignalSocket, subscribeChatSocket } from '../services/chatSocket';
import '../styles/chat-call.css';

type CallPhase = 'idle' | 'incoming' | 'outgoing' | 'connecting' | 'active';

type ActiveCall = {
  phase: CallPhase;
  conversationId: string;
  peerName: string;
  peerAvatar?: string | null;
  peerColor: string;
  video: boolean;
  incomingOffer?: RTCSessionDescriptionInit;
};

type ChatCallProviderProps = {
  children: ReactNode;
};

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

const getInitial = (name: string) => (name || 'U').trim().charAt(0).toUpperCase();

function ChatCallProvider({ children }: ChatCallProviderProps) {
  const [call, setCall] = useState<ActiveCall | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const callRef = useRef<ActiveCall | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const updateCallState = useCallback((nextCall: ActiveCall | null) => {
    callRef.current = nextCall;
    setCall(nextCall);
  }, []);

  useEffect(() => {
    callRef.current = call;
  }, [call]);

  const attachMediaElements = useCallback(() => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStreamRef.current;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStreamRef.current;
    }
  }, []);

  useEffect(() => {
    attachMediaElements();
  }, [attachMediaElements, call?.phase, call?.video]);

  const sendSignal = useCallback((payload: ChatCallSignal) => {
    return sendChatCallSignalSocket(payload);
  }, []);

  const cleanupCall = useCallback(() => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;

    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    pendingCandidatesRef.current = [];

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;

    setIsMuted(false);
    setIsCameraOff(false);
    updateCallState(null);
  }, [updateCallState]);

  const flushPendingCandidates = useCallback(async () => {
    const peerConnection = peerConnectionRef.current;
    if (!peerConnection?.remoteDescription) return;

    const pendingCandidates = pendingCandidatesRef.current;
    pendingCandidatesRef.current = [];

    for (const candidate of pendingCandidates) {
      try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error('Không thêm được ICE candidate đang chờ:', error);
      }
    }
  }, []);

  const createPeerConnection = useCallback(
    (conversationId: string, video: boolean) => {
      const peerConnection = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = peerConnection;
      remoteStreamRef.current = new MediaStream();

      peerConnection.onicecandidate = (event) => {
        if (!event.candidate) return;

        sendSignal({
          conversationId,
          signalType: 'ICE_CANDIDATE',
          video,
          candidate: event.candidate.toJSON(),
        });
      };

      peerConnection.ontrack = (event) => {
        const remoteStream = remoteStreamRef.current ?? new MediaStream();
        remoteStreamRef.current = remoteStream;

        const tracks = event.streams[0]?.getTracks() || [event.track];
        tracks.forEach((track) => {
          if (!remoteStream.getTracks().some((currentTrack) => currentTrack.id === track.id)) {
            remoteStream.addTrack(track);
          }
        });

        attachMediaElements();
        setCall((current) => {
          const nextCall =
            current && current.conversationId === conversationId
              ? { ...current, phase: 'active' as CallPhase }
              : current;
          callRef.current = nextCall;
          return nextCall;
        });
      };

      peerConnection.onconnectionstatechange = () => {
        if (['failed', 'disconnected', 'closed'].includes(peerConnection.connectionState)) {
          cleanupCall();
        }
      };

      return peerConnection;
    },
    [attachMediaElements, cleanupCall, sendSignal],
  );

  const openLocalStream = useCallback(
    async (video: boolean) => {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Trình duyệt chưa hỗ trợ camera/micro.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      });

      localStreamRef.current = stream;
      attachMediaElements();
      return stream;
    },
    [attachMediaElements],
  );

  const startCall = useCallback(
    async (conversation: ChatConversation, video: boolean) => {
      if (!conversation?.id || callRef.current) return;

      try {
        const localStream = await openLocalStream(video);
        const peerConnection = createPeerConnection(conversation.id, video);
        localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        updateCallState({
          phase: 'outgoing',
          conversationId: conversation.id,
          peerName: conversation.name,
          peerAvatar: conversation.avatarUrl,
          peerColor: conversation.avatarColor || '#1976d2',
          video,
        });

        const sent = sendSignal({
          conversationId: conversation.id,
          signalType: 'CALL_OFFER',
          video,
          sdp: offer,
        });

        if (!sent) {
          cleanupCall();
          alert('Chưa kết nối WebSocket chat, không thể bắt đầu cuộc gọi.');
        }
      } catch (error) {
        console.error('Không thể bắt đầu cuộc gọi:', error);
        cleanupCall();
        alert('Không thể mở camera/micro. Hãy kiểm tra quyền truy cập trình duyệt.');
      }
    },
    [cleanupCall, createPeerConnection, openLocalStream, sendSignal, updateCallState],
  );

  const acceptCall = useCallback(async () => {
    const currentCall = callRef.current;
    if (!currentCall || currentCall.phase !== 'incoming' || !currentCall.incomingOffer) return;

    try {
      const localStream = await openLocalStream(currentCall.video);
      const peerConnection = createPeerConnection(currentCall.conversationId, currentCall.video);
      localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

      await peerConnection.setRemoteDescription(new RTCSessionDescription(currentCall.incomingOffer));
      await flushPendingCandidates();

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      updateCallState({ ...currentCall, phase: 'connecting' });
      sendSignal({
        conversationId: currentCall.conversationId,
        signalType: 'CALL_ANSWER',
        video: currentCall.video,
        sdp: answer,
      });
    } catch (error) {
      console.error('Không thể nhận cuộc gọi:', error);
      sendSignal({
        conversationId: currentCall.conversationId,
        signalType: 'CALL_REJECT',
        video: currentCall.video,
      });
      cleanupCall();
      alert('Không thể mở camera/micro để nhận cuộc gọi.');
    }
  }, [cleanupCall, createPeerConnection, flushPendingCandidates, openLocalStream, sendSignal, updateCallState]);

  const rejectCall = useCallback(() => {
    const currentCall = callRef.current;
    if (!currentCall) return;

    sendSignal({
      conversationId: currentCall.conversationId,
      signalType: currentCall.phase === 'outgoing' ? 'CALL_CANCEL' : 'CALL_REJECT',
      video: currentCall.video,
    });
    cleanupCall();
  }, [cleanupCall, sendSignal]);

  const endCall = useCallback(() => {
    const currentCall = callRef.current;
    if (currentCall) {
      sendSignal({
        conversationId: currentCall.conversationId,
        signalType: 'CALL_END',
        video: currentCall.video,
      });
    }

    cleanupCall();
  }, [cleanupCall, sendSignal]);

  const handleIncomingSignal = useCallback(
    async (payload: ChatCallSignal) => {
      if (!payload?.conversationId || !payload.signalType) return;

      const currentCall = callRef.current;

      if (payload.signalType === 'CALL_OFFER') {
        if (currentCall) {
          sendSignal({
            conversationId: payload.conversationId,
            signalType: 'CALL_REJECT',
            video: payload.video,
          });
          return;
        }

        pendingCandidatesRef.current = [];
        updateCallState({
          phase: 'incoming',
          conversationId: payload.conversationId,
          peerName: payload.callerName || 'Người dùng',
          peerAvatar: payload.callerAvatar,
          peerColor: '#1976d2',
          video: payload.video,
          incomingOffer: payload.sdp as RTCSessionDescriptionInit,
        });
        return;
      }

      if (!currentCall || currentCall.conversationId !== payload.conversationId) return;

      if (payload.signalType === 'CALL_ANSWER' && payload.sdp) {
        try {
          await peerConnectionRef.current?.setRemoteDescription(
            new RTCSessionDescription(payload.sdp as RTCSessionDescriptionInit),
          );
          await flushPendingCandidates();
          setCall((current) => {
            const nextCall = current ? { ...current, phase: 'connecting' as CallPhase } : current;
            callRef.current = nextCall;
            return nextCall;
          });
        } catch (error) {
          console.error('Không xử lý được CALL_ANSWER:', error);
          cleanupCall();
        }
        return;
      }

      if (payload.signalType === 'ICE_CANDIDATE' && payload.candidate) {
        const candidate = payload.candidate as RTCIceCandidateInit;
        const peerConnection = peerConnectionRef.current;

        if (peerConnection?.remoteDescription) {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (error) {
            console.error('Không thêm được ICE candidate:', error);
          }
        } else {
          pendingCandidatesRef.current.push(candidate);
        }
        return;
      }

      if (['CALL_END', 'CALL_REJECT', 'CALL_CANCEL'].includes(payload.signalType)) {
        cleanupCall();
      }
    },
    [cleanupCall, flushPendingCandidates, sendSignal, updateCallState],
  );

  useEffect(() => {
    const disconnect = subscribeChatSocket({
      onCall: (payload) => {
        void handleIncomingSignal(payload);
      },
      onError: (error) => {
        console.error('Chat call socket error:', error);
      },
    });

    return disconnect;
  }, [handleIncomingSignal]);

  useEffect(() => {
    return () => cleanupCall();
  }, [cleanupCall]);

  const toggleMute = () => {
    const nextMuted = !isMuted;
    localStreamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = !nextMuted;
    });
    setIsMuted(nextMuted);
  };

  const toggleCamera = () => {
    const nextCameraOff = !isCameraOff;
    localStreamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = !nextCameraOff;
    });
    setIsCameraOff(nextCameraOff);
  };

  const statusText = (() => {
    if (!call) return '';
    if (call.phase === 'incoming') return call.video ? 'đang gọi video cho bạn' : 'đang gọi thoại cho bạn';
    if (call.phase === 'outgoing') return call.video ? 'Đang gọi video...' : 'Đang gọi thoại...';
    if (call.phase === 'connecting') return 'Đang kết nối...';
    return call.video ? 'Đang trong cuộc gọi video' : 'Đang trong cuộc gọi thoại';
  })();

  return (
    <ChatCallContext.Provider value={{ startCall, isInCall: Boolean(call) }}>
      {children}

      {call && (
        <div className="chat-call-backdrop" role="dialog" aria-modal="true" aria-label="Cuộc gọi">
          <div className={`chat-call-modal ${call.video ? 'video' : 'audio'}`}>
            <div className="chat-call-main">
              {call.video ? (
                <video ref={remoteVideoRef} className="chat-call-remote-video" autoPlay playsInline />
              ) : (
                <div className="chat-call-audio-panel">
                  <Avatar
                    src={call.peerAvatar || undefined}
                    sx={{ bgcolor: call.peerColor, width: 132, height: 132, fontSize: 48 }}
                  >
                    {getInitial(call.peerName)}
                  </Avatar>
                </div>
              )}

              <audio ref={remoteAudioRef} autoPlay />

              {call.video && (
                <video
                  ref={localVideoRef}
                  className="chat-call-local-video"
                  autoPlay
                  playsInline
                  muted
                  style={{ opacity: isCameraOff ? 0.18 : 1 }}
                />
              )}

              <div className="chat-call-info">
                <h3>{call.peerName}</h3>
                <p>{statusText}</p>
              </div>

              <div className="chat-call-controls">
                {call.phase === 'incoming' ? (
                  <>
                    <button
                      type="button"
                      className="chat-call-btn danger"
                      onClick={rejectCall}
                      aria-label="Từ chối cuộc gọi"
                    >
                      <CallEndRoundedIcon />
                    </button>
                    <button
                      type="button"
                      className="chat-call-btn accept"
                      onClick={() => void acceptCall()}
                      aria-label="Nhận cuộc gọi"
                    >
                      <CallRoundedIcon />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`chat-call-btn ${isMuted ? 'muted' : ''}`}
                      onClick={toggleMute}
                      aria-label="Bật hoặc tắt micro"
                    >
                      {isMuted ? <MicOffRoundedIcon /> : <MicRoundedIcon />}
                    </button>
                    {call.video && (
                      <button
                        type="button"
                        className={`chat-call-btn ${isCameraOff ? 'muted' : ''}`}
                        onClick={toggleCamera}
                        aria-label="Bật hoặc tắt camera"
                      >
                        {isCameraOff ? <VideocamOffRoundedIcon /> : <VideocamRoundedIcon />}
                      </button>
                    )}
                    <button
                      type="button"
                      className="chat-call-btn danger"
                      onClick={call.phase === 'outgoing' ? rejectCall : endCall}
                      aria-label="Kết thúc cuộc gọi"
                    >
                      <CallEndRoundedIcon />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </ChatCallContext.Provider>
  );
}

export default ChatCallProvider;
