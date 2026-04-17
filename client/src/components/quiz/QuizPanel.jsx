import { useState, useEffect } from 'react';
import { useSocket } from '../../hooks/useSocket';

export default function QuizPanel({ roomId, userId, userRole }) {
  const { emit, on, off } = useSocket();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [userAnswer, setUserAnswer] = useState(null);
  const [results, setResults] = useState(null);
  const [lastLaunchedQuestion, setLastLaunchedQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctOption: 0,
  });

  // Listen for quiz events
  useEffect(() => {
    on('quiz:new-question', (data) => {
      if (userRole === 'student') {
        setCurrentQuestion(data);
        setUserAnswer(null);
        setResults(null);
      } else {
        setLastLaunchedQuestion(data);
      }
    });

    on('quiz:show-results', (data) => {
      setResults(data);
    });

    return () => {
      off('quiz:new-question');
      off('quiz:show-results');
    };
  }, [on, off, userRole]);

  const handleCreateQuiz = () => {
    if (!formData.question || formData.options.some((opt) => !opt)) {
      alert('Please fill in all fields');
      return;
    }

    const quiz = {
      id: Date.now(),
      question: formData.question,
      options: formData.options,
      correctOption: formData.correctOption,
      createdBy: userId,
      roomId,
      timestamp: new Date(),
    };

    emit('quiz:new-question', quiz);
    setLastLaunchedQuestion(quiz);
    setFormData({ question: '', options: ['', '', '', ''], correctOption: 0 });
    setShowForm(true);
  };

  const handleAnswerSubmit = (optionIndex) => {
    const answer = {
      questionId: currentQuestion.id,
      userId,
      answer: optionIndex,
      isCorrect: optionIndex === currentQuestion.correctOption,
      timestamp: new Date(),
    };

    setUserAnswer(optionIndex);
    emit('quiz:submit-answer', answer);
  };

  const handleCloseQuiz = () => {
    setCurrentQuestion(null);
    setUserAnswer(null);
    setResults(null);
  };

  if (userRole === 'teacher' && !showForm) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-blue-800">📝 Quiz/Poll</h3>
          <button
            onClick={() => setShowForm(true)}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 font-medium"
          >
            + New Question
          </button>
        </div>
        {lastLaunchedQuestion ? (
          <p className="text-sm text-gray-600">
            Last sent: <span className="font-semibold">{lastLaunchedQuestion.question}</span>
          </p>
        ) : (
          <p className="text-sm text-gray-600">Create a question for students.</p>
        )}
      </div>
    );
  }

  if (!currentQuestion && !showForm) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-blue-800">📝 Quiz/Poll</h3>
          {userRole === 'teacher' && (
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 font-medium"
            >
              + New Question
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600">No active question</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4 shadow-sm max-h-96 overflow-y-auto">
        <h3 className="font-bold text-blue-800 mb-3">📝 Create Question</h3>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Enter your question"
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {formData.options.map((opt, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input
                type="radio"
                name="correct"
                checked={formData.correctOption === idx}
                onChange={() => setFormData({ ...formData, correctOption: idx })}
                className="cursor-pointer"
                title="Mark as correct answer"
              />
              <input
                type="text"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => {
                  const newOpts = [...formData.options];
                  newOpts[idx] = e.target.value;
                  setFormData({ ...formData, options: newOpts });
                }}
                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          ))}
          <p className="text-xs text-gray-600 ml-6">Select the correct option with the radio button</p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleCreateQuiz}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium"
            >
              📤 Send Question
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 px-3 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4 shadow-sm">
      <h3 className="font-bold text-blue-800 mb-4">❓ {currentQuestion.question}</h3>

      {results ? (
        <div className="space-y-2">
          {currentQuestion.options.map((opt, idx) => (
            <div
              key={idx}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                idx === currentQuestion.correctOption
                  ? 'bg-green-300 border-2 border-green-600 text-green-900'
                  : 'bg-gray-200 text-gray-800'
              } ${userAnswer === idx ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
            >
              <div className="flex justify-between items-center">
                <span>{opt}</span>
                {idx === currentQuestion.correctOption && <span className="text-green-700 font-bold">✓ Correct</span>}
              </div>
            </div>
          ))}
          <div className="mt-3 text-center font-semibold">
            {userAnswer === currentQuestion.correctOption ? (
              <p className="text-green-600">🎉 Your answer was correct!</p>
            ) : (
              <p className="text-red-600">❌ Your answer was incorrect</p>
            )}
          </div>
          {userRole === 'student' && userAnswer !== null && (
            <button
              onClick={handleCloseQuiz}
              className="mt-3 w-full px-3 py-2 rounded bg-gray-600 text-white text-sm font-medium hover:bg-gray-700"
            >
              Close Quiz
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = userAnswer === idx;
            const isCorrect = idx === currentQuestion.correctOption;
            const showFeedback = userAnswer !== null;

            return (
              <button
                key={idx}
                onClick={() => handleAnswerSubmit(idx)}
                disabled={showFeedback}
                className={`w-full px-3 py-3 rounded text-sm font-medium transition ${
                  showFeedback
                    ? isSelected
                      ? isCorrect
                        ? 'bg-green-500 text-white border-2 border-green-700 ring-2 ring-offset-1 ring-green-700'
                        : 'bg-red-500 text-white border-2 border-red-700 ring-2 ring-offset-1 ring-red-700'
                      : isCorrect
                      ? 'bg-green-100 text-green-800 border-2 border-green-500'
                      : 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    : 'bg-white border-2 border-blue-300 text-blue-800 hover:bg-blue-50 cursor-pointer'
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span>{opt}</span>
                  {showFeedback && isSelected && (
                    <span className="font-bold">
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  )}
                  {showFeedback && !isSelected && isCorrect && (
                    <span className="font-bold">Correct answer</span>
                  )}
                </span>
              </button>
            );
          })}
          {userAnswer !== null && (
            <div className="mt-3 space-y-2">
              <p className={`text-xs text-center font-semibold ${
                userAnswer === currentQuestion.correctOption ? 'text-green-700' : 'text-red-700'
              }`}>
                {userAnswer === currentQuestion.correctOption
                  ? 'Your answer was correct.'
                  : 'Your answer was incorrect.'}
              </p>
              {userRole === 'student' && (
                <button
                  onClick={handleCloseQuiz}
                  className="w-full px-3 py-2 rounded bg-gray-600 text-white text-sm font-medium hover:bg-gray-700"
                >
                  Close Quiz
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
