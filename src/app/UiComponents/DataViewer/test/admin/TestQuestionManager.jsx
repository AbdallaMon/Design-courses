"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  Stack,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  MdAdd as AddIcon,
  MdSave as SaveIcon,
  MdEdit as EditIcon,
  MdDelete as DeleteIcon,
  MdCancel as CancelIcon,
  MdExpandMore as ExpandMoreIcon,
  MdArrowUpward as ArrowUpIcon,
  MdArrowDownward as ArrowDownIcon,
} from "react-icons/md";
import { QuestionTypes } from "@/app/helpers/constants";
import { getDataAndSet } from "@/app/helpers/functions/getDataAndSet";
import LoadingOverlay from "@/app/UiComponents/feedback/loaders/LoadingOverlay";
import { useAlertContext } from "@/app/providers/MuiAlert";
import { useToastContext } from "@/app/providers/ToastLoadingProvider";
import { handleRequestSubmit } from "@/app/helpers/functions/handleSubmit";

const TestQuestionManager = ({ testId }) => {
  const [questions, setQuestions] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [newQuestion, setNewQuestion] = useState({
    type: "",
    question: "",
    choices: [],
  });
  const [reOrder, setReorder] = useState(false);

  const { setAlertError } = useAlertContext();
  const { toastLoading, setToastLoading } = useToastContext();
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    questionId: null,
  });
  const [loading, setLoading] = useState(false);

  // Debounce question text

  async function getQuestions() {
    await getDataAndSet({
      url: `admin/courses/tests/${testId}`,
      setLoading,
      setData: setQuestions,
    });
  }

  useEffect(() => {
    getQuestions();
  }, [testId]);

  // Initialize empty choice
  const createEmptyChoice = () => ({
    id: Date.now() + Math.random(),
    text: "",
    value: "",
    isCorrect: false,
    type: "CREATE",
  });

  // Handle question type change
  const handleTypeChange = (type) => {
    let choices = [];

    if (
      type === QuestionTypes.MULTIPLE_CHOICE ||
      type === QuestionTypes.SINGLE_CHOICE
    ) {
      choices = [createEmptyChoice(), createEmptyChoice()];
    } else if (type === QuestionTypes.TRUE_FALSE) {
      choices = [
        { id: 1, text: "True", value: "true", isCorrect: false },
        { id: 2, text: "False", value: "false", isCorrect: false },
      ];
    }

    setNewQuestion({
      type,
      question: "",
      choices,
    });
  };

  // Add new choice
  const addChoice = () => {
    setNewQuestion((prev) => ({
      ...prev,
      choices: [...prev.choices, createEmptyChoice()],
    }));
  };

  // Update choice
  const updateChoice = (choiceId, field, value, questionType) => {
    setNewQuestion((prev) => ({
      ...prev,
      choices: prev.choices.map((choice) =>
        choice.id === choiceId
          ? { ...choice, [field]: value }
          : (field === "isCorrect" &&
              prev.type === QuestionTypes.SINGLE_CHOICE) ||
            (field === "isCorrect" && QuestionTypes.TRUE_FALSE)
          ? { ...choice, isCorrect: false }
          : choice
      ),
    }));
  };

  // Remove choice
  const removeChoice = (choiceId) => {
    setNewQuestion((prev) => {
      return {
        ...prev,
        choices: prev.choices.filter((choice) => choice.id !== choiceId),
      };
    });
  };

  // Validate question
  const validateQuestion = (question) => {
    if (!question.question.trim()) return "Question text is required";
    if (!question.type) return "Question type is required";

    if (question.type !== QuestionTypes.TEXT) {
      if (question.choices.length < 2) return "At least 2 choices are required";
      if (question.choices.some((c) => !c.text.trim()))
        return "All choices must have text";
      if (!question.choices.some((c) => c.isCorrect))
        return "At least one correct answer is required";
    }

    return null;
  };

  // Save question
  const saveQuestion = async () => {
    const validation = validateQuestion(newQuestion);
    if (validation) {
      setAlertError(validation);
      return;
    }

    const req = await handleRequestSubmit(
      newQuestion,
      setToastLoading,
      `admin/courses/tests/${testId}/test-questions`,
      false,
      "Creating",
      false,
      "POST"
    );
    if (req.status === 200) {
      setNewQuestion({ type: "", question: "", choices: [] });
      setIsCreating(false);
      await getQuestions();
    }
  };

  // Delete question
  const deleteQuestion = async (questionId) => {
    const req = await handleRequestSubmit(
      {},
      setToastLoading,
      `admin/courses/tests/${testId}/test-questions/${questionId}`,
      false,
      "Deleting",
      false,
      "DELETE"
    );
    if (req.status === 200) {
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setDeleteDialog({ open: false, questionId: null });
    }
  };

  // Move question up/down
  const moveQuestion = async (questionId, direction) => {
    const currentIndex = questions.findIndex((q) => q.id === questionId);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= questions.length) return questions;

    const newQuestions = [...questions];
    [newQuestions[currentIndex], newQuestions[newIndex]] = [
      newQuestions[newIndex],
      newQuestions[currentIndex],
    ];
    setReorder(true);
    setQuestions(newQuestions);
  };
  async function saveReOrdering() {
    const req = await handleRequestSubmit(
      questions,
      setToastLoading,
      `admin/courses/tests/${testId}/test-questions/re-order`,
      false,
      "Saving"
    );
    if (req.status === 200) {
      setReorder(false);
    }
  }
  // Render question type selector
  const renderTypeSelector = () => (
    <FormControl fullWidth margin="normal">
      <InputLabel>Question Type</InputLabel>
      <Select
        value={newQuestion.type}
        onChange={(e) => handleTypeChange(e.target.value)}
        label="Question Type"
      >
        <MenuItem value={QuestionTypes.MULTIPLE_CHOICE}>
          Multiple Choice
        </MenuItem>
        <MenuItem value={QuestionTypes.SINGLE_CHOICE}>Single Choice</MenuItem>
        <MenuItem value={QuestionTypes.TRUE_FALSE}>True/False</MenuItem>
        <MenuItem value={QuestionTypes.TEXT}>Text Answer</MenuItem>
      </Select>
    </FormControl>
  );

  // Render choices editor
  const renderChoicesEditor = () => {
    if (newQuestion.type === QuestionTypes.TEXT) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Answer Choices
        </Typography>

        {newQuestion.choices.map((choice, index) => (
          <Card key={choice.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  fullWidth
                  label={`Choice ${index + 1}`}
                  value={choice.text}
                  onChange={(e) =>
                    updateChoice(choice.id, "text", e.target.value)
                  }
                  disabled={newQuestion.type === QuestionTypes.TRUE_FALSE}
                />

                {newQuestion.type === QuestionTypes.MULTIPLE_CHOICE ? (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={choice.isCorrect}
                        onChange={(e) =>
                          updateChoice(
                            choice.id,
                            "isCorrect",
                            e.target.checked,
                            newQuestion.type === QuestionTypes.TRUE_FALSE
                          )
                        }
                      />
                    }
                    label="Correct"
                  />
                ) : (
                  <FormControlLabel
                    control={
                      <Radio
                        checked={choice.isCorrect}
                        onChange={() =>
                          updateChoice(choice.id, "isCorrect", true)
                        }
                      />
                    }
                    label="Correct"
                  />
                )}

                {newQuestion.type !== QuestionTypes.TRUE_FALSE &&
                  newQuestion.choices.length > 2 && (
                    <IconButton
                      onClick={() => removeChoice(choice.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
              </Box>
            </CardContent>
          </Card>
        ))}

        {newQuestion.type !== QuestionTypes.TRUE_FALSE && (
          <Button
            startIcon={<AddIcon />}
            onClick={addChoice}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Add Choice
          </Button>
        )}
      </Box>
    );
  };

  // Render question creator
  const renderQuestionCreator = () => (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Create New Question
      </Typography>

      {renderTypeSelector()}

      {newQuestion.type && (
        <>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Question"
            value={newQuestion.question}
            onChange={(e) =>
              setNewQuestion((prev) => ({ ...prev, question: e.target.value }))
            }
            margin="normal"
            placeholder="Enter your question here..."
          />

          {renderChoicesEditor()}

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={saveQuestion}
              disabled={loading || !newQuestion.question.trim()}
            >
              Save Question
            </Button>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => {
                setNewQuestion({ type: "", question: "", choices: [] });
                setIsCreating(false);
              }}
            >
              Cancel
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );

  return (
    <Container maxWidth="lg">
      <Box display="flex" gap={2}>
        <Typography variant="h4" gutterBottom>
          Test Questions
        </Typography>
      </Box>
      {reOrder && (
        <Button
          variant="contained"
          onClick={saveReOrdering}
          sx={{ position: "fixed", top: 100, right: 100, zIndex: 1500 }}
        >
          Save new orders
        </Button>
      )}

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Test - ID: {testId}
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* Create Question Button */}
      {!isCreating && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsCreating(true)}
          sx={{ mb: 3 }}
          disabled={editingQuestionId !== null}
        >
          Create New Question
        </Button>
      )}

      {/* Question Creator */}
      {isCreating && renderQuestionCreator()}

      {/* Saved Questions */}
      {questions.length > 0 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Questions ({questions.length})
          </Typography>
          {questions.map((question, index) => (
            <SavedQuestion
              key={question.id}
              questionId={question.id}
              questions={questions}
              setQuestions={setQuestions}
              testId={testId}
              index={index}
              moveQuestion={moveQuestion}
              setDeleteDialog={setDeleteDialog}
            />
          ))}
        </Box>
      )}

      {questions.length === 0 && !isCreating && (
        <Paper sx={{ p: 4, textAlign: "center", mt: 3 }}>
          <Typography variant="h6" color="text.secondary">
            No questions created yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click "Create New Question" to get started
          </Typography>
        </Paper>
      )}

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, questionId: null })}
      >
        <DialogTitle>Delete Question</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this question? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, questionId: null })}
          >
            Cancel
          </Button>
          <Button
            onClick={() => deleteQuestion(deleteDialog.questionId)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

function SavedQuestion({
  questionId,
  testId,
  questions,
  index,
  moveQuestion,
  setDeleteDialog,
}) {
  const [question, setQuestion] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState({
    type: "",
    question: "",
    choices: [],
  });
  const { setAlertError } = useAlertContext();
  const { setToastLoading } = useToastContext();

  async function getQuestion() {
    await getDataAndSet({
      url: `admin/courses/tests/${testId}/test-questions/${questionId}`,
      setLoading,
      setData: setQuestion,
    });
  }

  useEffect(() => {
    getQuestion();
  }, [questionId]);

  // Initialize empty choice for editing
  const createEmptyChoice = () => ({
    id: Date.now() + Math.random(),
    text: "",
    value: "",
    isCorrect: false,
    type: "CREATE",
  });

  // Start editing
  const startEdit = () => {
    setEditedQuestion({
      type: question.type,
      question: question.question,
      choices:
        question.choices?.map((choice) => ({
          ...choice,
          id: choice.id || Date.now() + Math.random(),
        })) || [],
    });
    setIsEditing(true);
  };

  // Cancel editing
  const cancelEdit = () => {
    setIsEditing(false);
    setEditedQuestion({ type: "", question: "", choices: [] });
  };

  // Add new choice in edit mode
  const addChoice = () => {
    setEditedQuestion((prev) => ({
      ...prev,
      choices: [...prev.choices, createEmptyChoice()],
    }));
  };

  // Update choice in edit mode
  const updateChoice = (choiceId, field, value) => {
    setEditedQuestion((prev) => ({
      ...prev,
      choices: prev.choices.map((choice) =>
        choice.id === choiceId
          ? { ...choice, [field]: value }
          : (field === "isCorrect" &&
              prev.type === QuestionTypes.SINGLE_CHOICE) ||
            (field === "isCorrect" && QuestionTypes.TRUE_FALSE)
          ? { ...choice, isCorrect: false }
          : choice
      ),
    }));
  };

  // Remove choice in edit mode
  const removeChoice = (choiceId) => {
    setEditedQuestion((prev) => {
      return {
        ...prev,
        choices: prev.choices.map((choice) => {
          if (choice.id === choiceId) {
            choice.type = "DELETE";
          }
          return choice;
        }),
      };
    });
  };

  // Validate question
  const validateQuestion = (question) => {
    if (!question.question.trim()) return "Question text is required";
    if (!question.type) return "Question type is required";

    if (question.type !== QuestionTypes.TEXT) {
      if (question.choices.length < 2) return "At least 2 choices are required";
      if (question.choices.some((c) => !c.text.trim() && c.type !== "DELETE"))
        return "All choices must have text";
      if (!question.choices.some((c) => c.isCorrect && c.type !== "DELETE"))
        return "At least one correct answer is required";
    }

    return null;
  };

  // Save edited question
  const saveEdit = async () => {
    const validation = validateQuestion(editedQuestion);
    if (validation) {
      setAlertError(validation);
      return;
    }

    const req = await handleRequestSubmit(
      editedQuestion,
      setToastLoading,
      `admin/courses/tests/${testId}/test-questions/${questionId}`,
      false,
      "Updating",
      false,
      "PUT"
    );

    if (req.status === 200) {
      setIsEditing(false);
      await getQuestion(); // Refresh the question data
    }
  };

  // Render choices editor for edit mode
  const renderChoicesEditor = () => {
    if (editedQuestion.type === QuestionTypes.TEXT) return null;

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Answer Choices
        </Typography>

        {editedQuestion.choices.map((choice, index) => {
          if (choice.type === "DELETE") return;
          return (
            <Card key={choice.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <TextField
                    fullWidth
                    label={`Choice ${index + 1}`}
                    value={choice.text}
                    onChange={(e) =>
                      updateChoice(choice.id, "text", e.target.value)
                    }
                    disabled={editedQuestion.type === QuestionTypes.TRUE_FALSE}
                  />

                  {editedQuestion.type === QuestionTypes.MULTIPLE_CHOICE ? (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={choice.isCorrect}
                          onChange={(e) =>
                            updateChoice(
                              choice.id,
                              "isCorrect",
                              e.target.checked
                            )
                          }
                        />
                      }
                      label="Correct"
                    />
                  ) : (
                    <FormControlLabel
                      control={
                        <Radio
                          checked={choice.isCorrect}
                          onChange={() =>
                            updateChoice(choice.id, "isCorrect", true)
                          }
                        />
                      }
                      label="Correct"
                    />
                  )}

                  {editedQuestion.type !== QuestionTypes.TRUE_FALSE &&
                    editedQuestion.choices.length > 2 && (
                      <IconButton
                        onClick={() => removeChoice(choice.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                </Box>
              </CardContent>
            </Card>
          );
        })}

        {editedQuestion.type !== QuestionTypes.TRUE_FALSE && (
          <Button
            startIcon={<AddIcon />}
            onClick={addChoice}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            Add Choice
          </Button>
        )}
      </Box>
    );
  };

  return (
    <Accordion key={questionId} sx={{ mb: 2, position: "relative" }}>
      {loading && <LoadingOverlay />}
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
          <Typography variant="h6">Question {index + 1} </Typography>
          <Chip
            label={question?.type?.replace("_", " ")}
            size="small"
            variant="outlined"
          />
          <Typography variant="body2" sx={{ flex: 1, mr: 2 }}>
            {question?.question?.substring(0, 100)}...
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        {!isEditing ? (
          // View Mode
          <>
            <Typography variant="body1" gutterBottom>
              {question?.question}
            </Typography>

            {question?.type !== QuestionTypes.TEXT && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Answer Choices:
                </Typography>
                {question?.choices?.map((choice, idx) => (
                  <Box
                    key={choice.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {idx + 1}. {choice.text}
                    </Typography>
                    {choice.isCorrect && (
                      <Chip label="Correct" size="small" color="success" />
                    )}
                  </Box>
                ))}
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <IconButton
                onClick={() => moveQuestion(question?.id, "up")}
                disabled={index === 0}
                size="small"
              >
                <ArrowUpIcon />
              </IconButton>
              <IconButton
                onClick={() => moveQuestion(question?.id, "down")}
                disabled={index === questions.length - 1}
                size="small"
              >
                <ArrowDownIcon />
              </IconButton>
              <IconButton onClick={startEdit} size="small" color="primary">
                <EditIcon />
              </IconButton>
              <IconButton
                onClick={() =>
                  setDeleteDialog({ open: true, questionId: question?.id })
                }
                size="small"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          // Edit Mode
          <>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Question"
              value={editedQuestion.question}
              onChange={(e) =>
                setEditedQuestion((prev) => ({
                  ...prev,
                  question: e.target.value,
                }))
              }
              margin="normal"
              placeholder="Enter your question here..."
            />

            {renderChoicesEditor()}

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={saveEdit}
                disabled={loading || !editedQuestion.question.trim()}
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={cancelEdit}
              >
                Cancel
              </Button>
            </Box>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}

export default TestQuestionManager;
