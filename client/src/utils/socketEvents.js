// Socket.IO event names
export const SOCKET_EVENTS = {
  // Room events
  ROOM_JOIN: 'room:join',
  ROOM_JOINED: 'room:joined',
  ROOM_LEAVE: 'room:leave',
  ROOM_USER_JOINED: 'room:user-joined',
  ROOM_USER_LEFT: 'room:user-left',
  ROOM_RAISE_HAND: 'room:raise-hand',
  ROOM_LOWER_HAND: 'room:lower-hand',
  ROOM_HAND_RAISED: 'room:hand-raised',
  ROOM_HAND_LOWERED: 'room:hand-lowered',

  // Chat events
  CHAT_SEND_MESSAGE: 'chat:send-message',
  CHAT_NEW_MESSAGE: 'chat:new-message',
  CHAT_TYPING: 'chat:typing',
  CHAT_STOP_TYPING: 'chat:stop-typing',
  CHAT_USER_TYPING: 'chat:user-typing',
  CHAT_USER_STOP_TYPING: 'chat:user-stop-typing',
  CHAT_EDIT_MESSAGE: 'chat:edit-message',
  CHAT_MESSAGE_EDITED: 'chat:message-edited',
  CHAT_DELETE_MESSAGE: 'chat:delete-message',
  CHAT_MESSAGE_DELETED: 'chat:message-deleted',
  CHAT_ADD_REACTION: 'chat:add-reaction',
  CHAT_REACTION_ADDED: 'chat:reaction-added',

  // Whiteboard events
  WHITEBOARD_DRAW: 'whiteboard:draw',
  WHITEBOARD_STROKE_RECEIVED: 'whiteboard:stroke-received',
  WHITEBOARD_CLEAR: 'whiteboard:clear',
  WHITEBOARD_CLEARED: 'whiteboard:cleared',
  WHITEBOARD_UNDO: 'whiteboard:undo',
  WHITEBOARD_UNDO_ACTION: 'whiteboard:undo-action',
  WHITEBOARD_COLOR_CHANGE: 'whiteboard:color-change',
  WHITEBOARD_COLOR_CHANGED: 'whiteboard:color-changed',

  // Quiz events
  QUIZ_START: 'quiz:start',
  QUIZ_STARTED: 'quiz:started',
  QUIZ_NEXT_QUESTION: 'quiz:next-question',
  QUIZ_QUESTION_SHOW: 'quiz:question-show',
  QUIZ_SUBMIT_ANSWER: 'quiz:submit-answer',
  QUIZ_ANSWER_SUBMITTED: 'quiz:answer-submitted',
  QUIZ_END: 'quiz:end',
  QUIZ_ENDED: 'quiz:ended',
  QUIZ_SHOW_RESULTS: 'quiz:show-results',
  QUIZ_RESULTS_SHOWN: 'quiz:results-shown',

  // Reaction events
  REACTION_SEND: 'reaction:send',
  REACTION_RECEIVED: 'reaction:received',

  // WebRTC events
  WEBRTC_REQUEST_SCREEN_SHARE: 'webrtc:request-screen-share',
  WEBRTC_SCREEN_SHARE_STARTED: 'webrtc:screen-share-started',
  WEBRTC_STOP_SCREEN_SHARE: 'webrtc:stop-screen-share',
  WEBRTC_SCREEN_SHARE_STOPPED: 'webrtc:screen-share-stopped',
  WEBRTC_SEND_OFFER: 'webrtc:send-offer',
  WEBRTC_RECEIVE_OFFER: 'webrtc:receive-offer',
  WEBRTC_SEND_ANSWER: 'webrtc:send-answer',
  WEBRTC_RECEIVE_ANSWER: 'webrtc:receive-answer',
  WEBRTC_SEND_ICE_CANDIDATE: 'webrtc:send-ice-candidate',
  WEBRTC_RECEIVE_ICE_CANDIDATE: 'webrtc:receive-ice-candidate',

  // Audio events
  AUDIO_MIC_REQUEST: 'audio:micRequest',
  AUDIO_MIC_APPROVED: 'audio:micApproved',
  AUDIO_MIC_REJECTED: 'audio:micRejected',
  AUDIO_MIC_ENABLED: 'audio:micEnabled',
  AUDIO_MIC_DISABLED: 'audio:micDisabled',
  AUDIO_OFFER: 'audio:offer',
  AUDIO_ANSWER: 'audio:answer',
  AUDIO_ICE_CANDIDATE: 'audio:iceCandidate',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  ROOMS: '/api/rooms',
  CHAT: '/api/rooms/:roomId/chat',
  QUIZ: '/api/rooms/:roomId/quiz',
  BOARD: '/api/rooms/:roomId/board',
};

// Reaction emojis
export const REACTIONS = {
  THUMBS_UP: '👍',
  HEART: '❤️',
  SMILE: '😄',
  SURPRISE: '😮',
  SAD: '😢',
  FIRE: '🔥',
};

// Room settings defaults
export const DEFAULT_ROOM_SETTINGS = {
  allowChat: true,
  allowRaiseHand: true,
  allowScreenShare: true,
  allowReactions: true,
  allowQuiz: true,
};
