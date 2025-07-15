import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Checkbox,
  FormGroup,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  CircularProgress,
} from "@mui/material";
import {
  FaClock,
  FaPlay,
  FaEye,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
  FaEdit,
  FaQuestionCircle,
} from "react-icons/fa";
import { useAuth } from "@/app/providers/AuthProvider";

const TestComponent = ({ testId = 1 }) => {
  const [test, setTest] = useState(null);
  const { user } = useAuth();
  const userId = user?.id;
  const [attempts, setAttempts] = useState([]);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showNewAttemptDialog, setShowNewAttemptDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("attempts"); // 'attempts', 'test', 'review'
  const [selectedAttemptForReview, setSelectedAttemptForReview] =
    useState(null);

  // Mock API functions
  const mockAPI = {
    getTest: async (testId) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        id: testId,
        title: "Advanced JavaScript Concepts",
        type: "FINAL",
        attemptLimit: 3,
        timeLimit: 60, // minutes
        published: true,
        certificateApprovedByAdmin: false,
        course: { id: 1, title: "JavaScript Fundamentals" },
      };
    },

    getTestQuestions: async (testId) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [
        {
          id: 1,
          type: "MULTIPLE_CHOICE",
          question:
            "What is the difference between `let` and `var` in JavaScript?",
          order: 1,
          choices: [
            {
              id: 1,
              text: "Block scope vs function scope",
              value: "A",
              isCorrect: true,
            },
            { id: 2, text: "No difference", value: "B", isCorrect: false },
            { id: 3, text: "let is faster", value: "C", isCorrect: false },
            { id: 4, text: "var is newer", value: "D", isCorrect: false },
          ],
        },
        {
          id: 2,
          type: "SINGLE_CHOICE",
          question:
            "Which method is used to add elements to the end of an array?",
          order: 2,
          choices: [
            { id: 5, text: "push()", value: "A", isCorrect: true },
            { id: 6, text: "pop()", value: "B", isCorrect: false },
            { id: 7, text: "shift()", value: "C", isCorrect: false },
            { id: 8, text: "unshift()", value: "D", isCorrect: false },
          ],
        },
        {
          id: 3,
          type: "TRUE_FALSE",
          question: "JavaScript is a compiled language.",
          order: 3,
          choices: [
            { id: 9, text: "True", value: "true", isCorrect: false },
            { id: 10, text: "False", value: "false", isCorrect: true },
          ],
        },
        {
          id: 4,
          type: "TEXT",
          question:
            "Explain the concept of closures in JavaScript in your own words.",
          order: 4,
          choices: [],
        },
      ];
    },

    getUserAttempts: async (userId, testId) => {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return [
        {
          id: 1,
          userId,
          testId,
          score: 75.5,
          passed: true,
          attemptCount: 1,
          attemptLimit: 3,
          createdAt: new Date("2024-01-15T10:30:00"),
          startTime: new Date("2024-01-15T10:30:00"),
          endTime: new Date("2024-01-15T11:15:00"),
          timePassed: 45,
          answers: [
            {
              id: 1,
              questionId: 1,
              selectedAnswers: [{ value: "A" }],
              textAnswer: null,
            },
            {
              id: 2,
              questionId: 2,
              selectedAnswers: [{ value: "A" }],
              textAnswer: null,
            },
            {
              id: 3,
              questionId: 3,
              selectedAnswers: [{ value: "false" }],
              textAnswer: null,
            },
            {
              id: 4,
              questionId: 4,
              selectedAnswers: [],
              textAnswer:
                "Closures are functions that have access to variables from their outer scope even after the outer function has returned.",
            },
          ],
        },
        {
          id: 2,
          userId,
          testId,
          score: null,
          passed: false,
          attemptCount: 2,
          attemptLimit: 3,
          createdAt: new Date("2024-01-20T14:00:00"),
          startTime: new Date("2024-01-20T14:00:00"),
          endTime: null,
          timePassed: null,
          answers: [
            {
              id: 5,
              questionId: 1,
              selectedAnswers: [{ value: "A" }],
              textAnswer: null,
            },
            {
              id: 6,
              questionId: 2,
              selectedAnswers: [],
              textAnswer: null,
            },
          ],
        },
      ];
    },

    createAttempt: async (userId, testId) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return {
        id: 3,
        userId,
        testId,
        score: null,
        passed: false,
        attemptCount: 3,
        attemptLimit: 3,
        createdAt: new Date(),
        startTime: new Date(),
        endTime: null,
        timePassed: null,
        answers: [],
      };
    },

    saveAnswer: async (attemptId, questionId, answer) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return {
        id: Math.random(),
        attemptId,
        questionId,
        selectedAnswers: answer.selectedAnswers || [],
        textAnswer: answer.textAnswer || null,
      };
    },

    submitAttempt: async (attemptId) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        score: 82.5,
        passed: true,
        endTime: new Date(),
        timePassed: 45,
      };
    },
  };

  // Load initial data
  useEffect(() => {
    loadTestData();
  }, [testId, userId]);

  const loadTestData = async () => {
    setLoading(true);
    try {
      const [testData, questionsData, attemptsData] = await Promise.all([
        mockAPI.getTest(testId),
        mockAPI.getTestQuestions(testId),
        mockAPI.getUserAttempts(userId, testId),
      ]);

      setTest(testData);
      setQuestions(questionsData);
      setAttempts(attemptsData);

      // Check if there's an ongoing attempt
      const ongoingAttempt = attemptsData.find((a) => !a.endTime);
      if (ongoingAttempt) {
        setCurrentAttempt(ongoingAttempt);
        setViewMode("test");
        loadUserAnswers(ongoingAttempt.answers);
        startTimer(ongoingAttempt);
      }
    } catch (error) {
      console.error("Error loading test data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserAnswers = (answers) => {
    const answersMap = {};
    answers.forEach((answer) => {
      answersMap[answer.questionId] = {
        selectedAnswers: answer.selectedAnswers.map((sa) => sa.value),
        textAnswer: answer.textAnswer,
      };
    });
    setUserAnswers(answersMap);
  };

  const startTimer = (attempt) => {
    if (!test?.timeLimit) return;

    const startTime = new Date(attempt.startTime);
    const now = new Date();
    const elapsedMinutes = Math.floor((now - startTime) / (1000 * 60));
    const remainingMinutes = test.timeLimit - elapsedMinutes;

    if (remainingMinutes > 0) {
      setTimeLeft(remainingMinutes * 60); // Convert to seconds
      setIsTimerRunning(true);
    } else {
      // Time's up, auto-submit
      handleSubmitAttempt();
    }
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleSubmitAttempt();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartNewAttempt = async () => {
    try {
      const newAttempt = await mockAPI.createAttempt(userId, testId);
      setCurrentAttempt(newAttempt);
      setAttempts((prev) => [...prev, newAttempt]);
      setUserAnswers({});
      setCurrentQuestionIndex(0);
      setViewMode("test");
      setShowNewAttemptDialog(false);

      if (test?.timeLimit) {
        setTimeLeft(test.timeLimit * 60);
        setIsTimerRunning(true);
      }
    } catch (error) {
      console.error("Error starting new attempt:", error);
    }
  };

  const handleAnswerChange = async (questionId, answer) => {
    const newAnswers = { ...userAnswers, [questionId]: answer };
    setUserAnswers(newAnswers);

    if (currentAttempt) {
      try {
        await mockAPI.saveAnswer(currentAttempt.id, questionId, answer);
      } catch (error) {
        console.error("Error saving answer:", error);
      }
    }
  };

  const handleSubmitAttempt = async () => {
    if (!currentAttempt) return;

    try {
      setIsTimerRunning(false);
      const result = await mockAPI.submitAttempt(currentAttempt.id);

      const updatedAttempt = {
        ...currentAttempt,
        score: result.score,
        passed: result.passed,
        endTime: result.endTime,
        timePassed: result.timePassed,
      };

      setAttempts((prev) =>
        prev.map((a) => (a.id === currentAttempt.id ? updatedAttempt : a))
      );
      setCurrentAttempt(null);
      setViewMode("attempts");
      setUserAnswers({});
      setTimeLeft(0);
    } catch (error) {
      console.error("Error submitting attempt:", error);
    }
  };

  const canStartNewAttempt = () => {
    if (!test) return false;
    const completedAttempts = attempts.filter((a) => a.endTime).length;
    const ongoingAttempt = attempts.find((a) => !a.endTime);
    return completedAttempts < test.attemptLimit && !ongoingAttempt;
  };

  const renderQuestionContent = (
    question,
    isReview = false,
    reviewAnswers = null
  ) => {
    const currentAnswer = isReview
      ? reviewAnswers?.[question.id]
      : userAnswers[question.id];

    const handleChange = (answer) => {
      if (!isReview) {
        handleAnswerChange(question.id, answer);
      }
    };

    switch (question.type) {
      case "MULTIPLE_CHOICE":
        return (
          <FormControl component="fieldset" fullWidth disabled={isReview}>
            <FormLabel component="legend">Select all that apply:</FormLabel>
            <FormGroup>
              {question.choices.map((choice) => (
                <FormControlLabel
                  key={choice.id}
                  control={
                    <Checkbox
                      checked={
                        currentAnswer?.selectedAnswers?.includes(
                          choice.value
                        ) || false
                      }
                      onChange={(e) => {
                        const current = currentAnswer?.selectedAnswers || [];
                        const newSelected = e.target.checked
                          ? [...current, choice.value]
                          : current.filter((v) => v !== choice.value);
                        handleChange({ selectedAnswers: newSelected });
                      }}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {choice.text}
                      {isReview && choice.isCorrect && (
                        <FaCheck color="green" />
                      )}
                      {isReview &&
                        !choice.isCorrect &&
                        currentAnswer?.selectedAnswers?.includes(
                          choice.value
                        ) && <FaTimes color="red" />}
                    </Box>
                  }
                />
              ))}
            </FormGroup>
          </FormControl>
        );

      case "SINGLE_CHOICE":
        return (
          <FormControl component="fieldset" fullWidth disabled={isReview}>
            <FormLabel component="legend">Select one:</FormLabel>
            <RadioGroup
              value={currentAnswer?.selectedAnswers?.[0] || ""}
              onChange={(e) =>
                handleChange({ selectedAnswers: [e.target.value] })
              }
            >
              {question.choices.map((choice) => (
                <FormControlLabel
                  key={choice.id}
                  value={choice.value}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {choice.text}
                      {isReview && choice.isCorrect && (
                        <FaCheck color="green" />
                      )}
                      {isReview &&
                        !choice.isCorrect &&
                        currentAnswer?.selectedAnswers?.includes(
                          choice.value
                        ) && <FaTimes color="red" />}
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case "TRUE_FALSE":
        return (
          <FormControl component="fieldset" fullWidth disabled={isReview}>
            <FormLabel component="legend">True or False:</FormLabel>
            <RadioGroup
              value={currentAnswer?.selectedAnswers?.[0] || ""}
              onChange={(e) =>
                handleChange({ selectedAnswers: [e.target.value] })
              }
            >
              {question.choices.map((choice) => (
                <FormControlLabel
                  key={choice.id}
                  value={choice.value}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {choice.text}
                      {isReview && choice.isCorrect && (
                        <FaCheck color="green" />
                      )}
                      {isReview &&
                        !choice.isCorrect &&
                        currentAnswer?.selectedAnswers?.includes(
                          choice.value
                        ) && <FaTimes color="red" />}
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case "TEXT":
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={currentAnswer?.textAnswer || ""}
            onChange={(e) => handleChange({ textAnswer: e.target.value })}
            placeholder="Enter your answer here..."
            disabled={isReview}
          />
        );

      default:
        return null;
    }
  };

  const renderAttemptsList = () => (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Test Attempts</Typography>
        {canStartNewAttempt() && (
          <Button
            variant="contained"
            startIcon={<FaPlay />}
            onClick={() => setShowNewAttemptDialog(true)}
          >
            Start New Attempt
          </Button>
        )}
      </Box>

      {attempts.length === 0 ? (
        <Alert severity="info">
          No attempts yet. Click "Start New Attempt" to begin.
        </Alert>
      ) : (
        <List>
          {attempts.map((attempt, index) => (
            <Paper key={attempt.id} sx={{ mb: 2 }}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="h6">
                        Attempt {attempt.attemptCount}
                      </Typography>
                      {attempt.endTime ? (
                        <Chip
                          label={attempt.passed ? "Passed" : "Failed"}
                          color={attempt.passed ? "success" : "error"}
                          size="small"
                        />
                      ) : (
                        <Chip
                          label="In Progress"
                          color="warning"
                          size="small"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        Started: {new Date(attempt.startTime).toLocaleString()}
                      </Typography>
                      {attempt.endTime && (
                        <>
                          <Typography variant="body2">
                            Completed:{" "}
                            {new Date(attempt.endTime).toLocaleString()}
                          </Typography>
                          <Typography variant="body2">
                            Score: {attempt.score}% | Time: {attempt.timePassed}{" "}
                            minutes
                          </Typography>
                        </>
                      )}
                    </Box>
                  }
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  {!attempt.endTime ? (
                    <Button
                      variant="contained"
                      startIcon={<FaEdit />}
                      onClick={() => {
                        setCurrentAttempt(attempt);
                        setViewMode("test");
                        loadUserAnswers(attempt.answers);
                        startTimer(attempt);
                      }}
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<FaEye />}
                      onClick={() => {
                        setSelectedAttemptForReview(attempt);
                        setViewMode("review");
                      }}
                    >
                      Review
                    </Button>
                  )}
                </Box>
              </ListItem>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );

  const renderTestView = () => {
    if (!questions.length) return null;

    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <Box>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Button
            startIcon={<FaArrowLeft />}
            onClick={() => setViewMode("attempts")}
          >
            Back to Attempts
          </Button>
          {test?.timeLimit && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FaClock />
              <Typography
                variant="h6"
                color={timeLeft < 300 ? "error" : "inherit"}
              >
                {formatTime(timeLeft)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>
            <Typography variant="body2">
              {Math.round(progress)}% Complete
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} />
        </Box>

        {/* Question Stepper */}
        <Box sx={{ mb: 3 }}>
          <Stepper nonLinear activeStep={currentQuestionIndex}>
            {questions.map((question, index) => (
              <Step key={question.id}>
                <StepButton
                  onClick={() => setCurrentQuestionIndex(index)}
                  completed={userAnswers[question.id] !== undefined}
                >
                  {index + 1}
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Current Question */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <FaQuestionCircle />
              <Typography variant="h6">
                Question {currentQuestionIndex + 1}
              </Typography>
              <Chip
                label={currentQuestion.type.replace("_", " ")}
                size="small"
                variant="outlined"
              />
            </Box>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {currentQuestion.question}
            </Typography>
            {renderQuestionContent(currentQuestion)}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Button
            startIcon={<FaArrowLeft />}
            onClick={() =>
              setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))
            }
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>

          <Box sx={{ display: "flex", gap: 2 }}>
            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                variant="contained"
                color="success"
                startIcon={<FaCheck />}
                onClick={handleSubmitAttempt}
              >
                Submit Test
              </Button>
            ) : (
              <Button
                endIcon={<FaArrowRight />}
                onClick={() =>
                  setCurrentQuestionIndex(
                    Math.min(questions.length - 1, currentQuestionIndex + 1)
                  )
                }
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  const renderReviewView = () => {
    if (!selectedAttemptForReview) return null;

    const reviewAnswers = {};
    selectedAttemptForReview.answers.forEach((answer) => {
      reviewAnswers[answer.questionId] = {
        selectedAnswers: answer.selectedAnswers.map((sa) => sa.value),
        textAnswer: answer.textAnswer,
      };
    });

    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Button
            startIcon={<FaArrowLeft />}
            onClick={() => setViewMode("attempts")}
          >
            Back to Attempts
          </Button>
          <Typography variant="h5">
            Review Attempt {selectedAttemptForReview.attemptCount}
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          Score: {selectedAttemptForReview.score}% | Status:{" "}
          {selectedAttemptForReview.passed ? "Passed" : "Failed"} | Time:{" "}
          {selectedAttemptForReview.timePassed} minutes
        </Alert>

        {questions.map((question, index) => (
          <Card key={question.id} sx={{ mb: 3 }}>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Typography variant="h6">Question {index + 1}</Typography>
                <Chip
                  label={question.type.replace("_", " ")}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {question.question}
              </Typography>
              {renderQuestionContent(question, true, reviewAnswers)}
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!test) {
    return (
      <Alert severity="error">
        Test not found or you don't have permission to access it.
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", p: 3 }}>
      {/* Test Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {test.title}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Chip label={test.type} variant="outlined" />
          <Chip
            label={`${test.attemptLimit} attempts allowed`}
            variant="outlined"
          />
          {test.timeLimit && (
            <Chip label={`${test.timeLimit} minutes`} variant="outlined" />
          )}
        </Box>
        <Typography variant="body1" color="text.secondary">
          Course: {test.course?.title}
        </Typography>
      </Paper>

      {/* Main Content */}
      {viewMode === "attempts" && renderAttemptsList()}
      {viewMode === "test" && renderTestView()}
      {viewMode === "review" && renderReviewView()}

      {/* New Attempt Dialog */}
      <Dialog
        open={showNewAttemptDialog}
        onClose={() => setShowNewAttemptDialog(false)}
      >
        <DialogTitle>Start New Test Attempt</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            You are about to start a new test attempt.
            {test.timeLimit &&
              ` You will have ${test.timeLimit} minutes to complete the test.`}
          </Typography>
          <Alert severity="warning">
            Make sure you have a stable internet connection and enough time to
            complete the test.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewAttemptDialog(false)}>Cancel</Button>
          <Button onClick={handleStartNewAttempt} variant="contained">
            Start Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TestComponent;
