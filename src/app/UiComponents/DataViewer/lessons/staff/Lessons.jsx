"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Paper,
  Button,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  MdPlayArrow as PlayArrow,
  MdLock as Lock,
  MdCheckCircle as CheckCircle,
  MdQuiz as Quiz,
  MdAssignment as Assignment,
  MdSchool as School,
  MdArrowBack as ArrowBack,
} from "react-icons/md";
import LessonComponent from "./Lesson";
import TestComponent from "../../test/staff/Test";

// Mock data structure matching your DB schema
const mockCourseData = {
  id: 1,
  title: "Advanced React Development",
  description:
    "Master advanced React concepts including hooks, context, performance optimization, and testing",
  imageUrl: "https://via.placeholder.com/400x200",
  isPublished: true,
  lessons: [
    {
      id: 1,
      title: "Introduction to React Hooks",
      description:
        "Learn the fundamentals of React hooks including useState and useEffect",
      duration: 45,
      order: 1,
      isPreviewable: true,
      videos: [{ url: "https://example.com/video1" }],
      tests: [],
    },
    {
      id: 2,
      title: "Advanced Hook Patterns",
      description: "Explore custom hooks and advanced patterns",
      duration: 60,
      order: 2,
      isPreviewable: false,
      videos: [{ url: "https://example.com/video2" }],
      tests: [],
    },
    {
      id: 3,
      title: "Context API and State Management",
      description: "Deep dive into React Context and state management patterns",
      duration: 75,
      order: 3,
      isPreviewable: false,
      videos: [{ url: "https://example.com/video3" }],
      tests: [
        {
          id: 1,
          title: "Context API Quiz",
          type: "LESSON",
          questions: [
            {
              id: 1,
              type: "MULTIPLE_CHOICE",
              question: "What is the main purpose of React Context?",
              choices: [
                { text: "State management", value: "state", isCorrect: true },
                { text: "Routing", value: "routing", isCorrect: false },
              ],
            },
          ],
        },
        {
          id: 2,
          title: "State Management Assessment",
          type: "LESSON",
          questions: [
            {
              id: 2,
              type: "TRUE_FALSE",
              question: "Context should be used for all state management",
              choices: [
                { text: "True", value: "true", isCorrect: false },
                { text: "False", value: "false", isCorrect: true },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 4,
      title: "Performance Optimization",
      description: "Learn React performance optimization techniques",
      duration: 90,
      order: 4,
      isPreviewable: false,
      videos: [{ url: "https://example.com/video4" }],
      tests: [],
    },
    {
      id: 5,
      title: "Testing React Applications",
      description: "Comprehensive testing strategies for React apps",
      duration: 120,
      order: 5,
      isPreviewable: false,
      videos: [{ url: "https://example.com/video5" }],
      tests: [],
    },
    {
      id: 6,
      title: "Advanced Patterns and Best Practices",
      description: "Learn advanced React patterns and industry best practices",
      duration: 100,
      order: 6,
      isPreviewable: false,
      videos: [{ url: "https://example.com/video6" }],
      tests: [],
    },
  ],
  tests: [
    {
      id: 10,
      title: "Final Assessment Part 1",
      type: "FINAL",
      questions: [
        {
          id: 10,
          type: "MULTIPLE_CHOICE",
          question: "Which hook is used for side effects?",
          choices: [
            { text: "useEffect", value: "useEffect", isCorrect: true },
            { text: "useState", value: "useState", isCorrect: false },
          ],
        },
      ],
    },
    {
      id: 11,
      title: "Final Assessment Part 2",
      type: "FINAL",
      questions: [
        {
          id: 11,
          type: "TEXT",
          question: "Explain the concept of lifting state up in React",
          choices: [],
        },
      ],
    },
  ],
};

const mockUserProgress = {
  completedLessons: [1, 2], // lesson IDs
  passedTests: [1], // test IDs
  testAttempts: [
    { testId: 1, passed: true, score: 85 },
    { testId: 2, passed: false, score: 45 },
  ],
};

// Simple Lesson Component
const LessonView = ({ isCompleted, lesson, onBack }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      <Box sx={{ mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 2 }}>
          Back to Course
        </Button>
        <LessonComponent
          isCompleted={isCompleted}
          lessonId={lesson.id}
          courseId={lesson.courseId}
        />
      </Box>
    </Container>
  );
};

const TestView = ({ test, onBack }) => {
  return (
    <Container maxWidth="md" sx={{ py: 2 }}>
      <Box>
        <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mb: 2 }}>
          Back to Course
        </Button>
      </Box>
      <TestComponent testId={test.id} />
    </Container>
  );
};

const LesssonView = ({ courseId }) => {
  const [course, setCourse] = useState(mockCourseData);
  const [userProgress] = useState(mockUserProgress);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewType, setViewType] = useState("course"); // 'course', 'lesson', 'test'

  const createCourseStructure = () => {
    const items = [];

    course.lessons.forEach((lesson) => {
      items.push({
        type: "lesson",
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        duration: lesson.duration,
        order: lesson.order,
        data: lesson,
      });

      // Add tests after the lesson
      if (lesson.tests && lesson.tests.length > 0) {
        lesson.tests.forEach((test) => {
          items.push({
            type: "test",
            id: test.id,
            title: test.title,
            lessonId: lesson.id,
            order: lesson.order,
            data: test,
          });
        });
      }
    });

    // Add final tests at the end
    course.tests.forEach((test) => {
      items.push({
        type: "test",
        id: test.id,
        title: test.title,
        isFinal: true,
        order: 999,
        data: test,
      });
    });

    return items;
  };

  const isItemAccessible = (item, index, items) => {
    if (item.type === "lesson") {
      // First lesson is always accessible if previewable
      if (index === 0 && item.data.isPreviewable) return true;

      // Check if previous lesson is completed
      const prevItems = items.slice(0, index);
      const prevLesson = prevItems.reverse().find((i) => i.type === "lesson");

      if (!prevLesson) return item.data.isPreviewable;

      return userProgress.completedLessons.includes(prevLesson.id);
    }

    if (item.type === "test") {
      if (item.isFinal) {
        // Final tests require all lessons to be completed
        return course.lessons.every((lesson) =>
          userProgress.completedLessons.includes(lesson.id)
        );
      }

      // Lesson tests require the lesson to be completed
      return userProgress.completedLessons.includes(item.lessonId);
    }

    return false;
  };

  const getItemStatus = (item) => {
    if (item.type === "lesson") {
      return userProgress.completedLessons.includes(item.id)
        ? "completed"
        : "pending";
    }

    if (item.type === "test") {
      const attempt = userProgress.testAttempts.find(
        (a) => a.testId === item.id
      );
      if (attempt) {
        return attempt.passed ? "passed" : "failed";
      }
      return "pending";
    }

    return "pending";
  };

  const getStatusIcon = (item, isAccessible) => {
    if (!isAccessible) return <Lock color="disabled" />;

    const status = getItemStatus(item);

    if (item.type === "lesson") {
      return status === "completed" ? (
        <CheckCircle color="success" />
      ) : (
        <PlayArrow color="primary" />
      );
    }

    if (item.type === "test") {
      if (status === "passed") return <CheckCircle color="success" />;
      if (status === "failed") return <Assignment color="error" />;
      return <Quiz color="primary" />;
    }
  };

  const getStatusChip = (item, isAccessible) => {
    if (!isAccessible)
      return <Chip label="Locked" size="small" color="default" />;

    const status = getItemStatus(item);

    if (item.type === "lesson") {
      return status === "completed" ? (
        <Chip label="Completed" size="small" color="success" />
      ) : (
        <Chip label="Start" size="small" color="primary" />
      );
    }

    if (item.type === "test") {
      if (status === "passed")
        return <Chip label="Passed" size="small" color="success" />;
      if (status === "failed")
        return <Chip label="Retry" size="small" color="error" />;
      return <Chip label="Take Test" size="small" color="primary" />;
    }
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setViewType(item.type);

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("type", item.type);
    searchParams.set("itemId", item.id);

    const newRelativePathQuery = `${
      window.location.pathname
    }?${searchParams.toString()}`;
    window.history.pushState(null, "", newRelativePathQuery);
  };

  const handleBack = () => {
    setSelectedItem(null);
    setViewType("course");

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("type");
    searchParams.delete("itemId");

    const newRelativePathQuery = `${window.location.pathname}${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    window.history.pushState(null, "", newRelativePathQuery);
  };

  const calculateProgress = () => {
    const totalLessons = course.lessons.length;
    const completedLessons = userProgress.completedLessons.length;
    return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  };
  const courseItems = createCourseStructure();
  if (viewType === "lesson" && selectedItem) {
    return (
      <LessonView
        isCompleted={userProgress.completedLessons.includes(
          selectedItem.data.id
        )}
        lesson={selectedItem.data}
        onBack={handleBack}
      />
    );
  }

  if (viewType === "test" && selectedItem) {
    return <TestView test={selectedItem.data} onBack={handleBack} />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Course Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <School sx={{ mr: 2, fontSize: 40, color: "primary.main" }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                {course.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {course.description}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Course Progress: {Math.round(calculateProgress())}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={calculateProgress()}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={`${course.lessons.length} Lessons`}
              variant="outlined"
              size="small"
            />
            <Chip
              label={`${userProgress.completedLessons.length} Completed`}
              variant="outlined"
              size="small"
              color="success"
            />
            <Chip
              label={`${course.tests.length} Final Tests`}
              variant="outlined"
              size="small"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Course Content */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Course Content
          </Typography>

          <List>
            {courseItems.map((item, index) => {
              const isAccessible = isItemAccessible(item, index, courseItems);

              return (
                <React.Fragment key={`${item.type}-${item.id}`}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => isAccessible && handleItemClick(item)}
                      disabled={!isAccessible}
                      sx={{
                        py: 2,
                        "&:hover": {
                          bgcolor: isAccessible
                            ? "action.hover"
                            : "transparent",
                        },
                      }}
                    >
                      <ListItemIcon>
                        {getStatusIcon(item, isAccessible)}
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{
                                fontWeight:
                                  item.type === "lesson" ? "medium" : "normal",
                                color: !isAccessible
                                  ? "text.disabled"
                                  : "text.primary",
                              }}
                            >
                              {item.title}
                            </Typography>
                            {getStatusChip(item, isAccessible)}
                          </Box>
                        }
                        secondary={
                          <Box>
                            {item.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {item.description}
                              </Typography>
                            )}
                            {item.duration && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Duration: {item.duration} minutes
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>

                  {index < courseItems.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LesssonView;
