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
import { getDataAndSet } from "@/app/helpers/functions/getDataAndSet";
import FullScreenLoader from "@/app/UiComponents/feedback/loaders/FullscreenLoader";
import { useAuth } from "@/app/providers/AuthProvider";
import { useSearchParams } from "next/navigation";

// Simple Lesson Component
const LessonView = ({ isCompleted, lesson, onBack, onComplete }) => {
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
          onComplete={onComplete}
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
  const [course, setCourse] = useState();
  const [userProgress, setUserProgress] = useState();
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewType, setViewType] = useState("course");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  let stop = false;
  let lastAvailableIndex = 0;
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const itemId = searchParams.get("itemId");
  async function getCourse() {
    await getDataAndSet({
      url: `shared/courses/${courseId}?role=${user.role}&`,
      setLoading,
      setData: setCourse,
    });
    await getDataAndSet({
      url: `shared/courses/${courseId}/progress?role=${user.role}&`,
      setLoading,
      setData: setUserProgress,
    });
  }
  const createCourseStructure = () => {
    if (!course || !course.lessons) return;
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
      if (userProgress?.completedLessons.includes(lesson.id) && !stop) {
        lastAvailableIndex++;
      } else {
        stop = true;
      }
      // Add tests after the lesson
      if (lesson.tests && lesson.tests.length > 0) {
        lesson.tests.forEach((test) => {
          if (test.attempts.length > 0 && !stop) {
            lastAvailableIndex++;
          } else {
            stop = true;
          }
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
  const courseItems = createCourseStructure();

  useEffect(() => {
    getCourse();
  }, [courseId]);
  useEffect(() => {
    if (
      course &&
      userProgress &&
      itemId &&
      type &&
      courseItems &&
      courseItems.length > 0 &&
      !selectedItem &&
      viewType !== "COURSE"
    ) {
      const item = courseItems?.find(
        (item) => item.id == itemId && type === item.type
      );

      setSelectedItem(item);

      setViewType(type);
    }
  }, [type, itemId, course, userProgress, courseItems, selectedItem]);

  const isItemAccessible = (item, index, items) => {
    return index <= lastAvailableIndex;
  };

  const getItemStatus = (item) => {
    if (item.type === "lesson") {
      return userProgress?.completedLessons.includes(item.id)
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
    if (!item) return;
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
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("type");
    searchParams.delete("itemId");

    const newRelativePathQuery = `${window.location.pathname}${
      searchParams.toString() ? `?${searchParams.toString()}` : ""
    }`;
    window.history.pushState(null, "", newRelativePathQuery);
    window.setTimeout(() => {
      setSelectedItem(null);
      setViewType("course");
    }, 50);
  };

  const calculateProgress = () => {
    const items = courseItems;
    return items?.length > 0 ? (lastAvailableIndex / items.length) * 100 : 0;
  };
  if (viewType === "lesson" && selectedItem) {
    return (
      <LessonView
        isCompleted={userProgress.completedLessons.includes(
          selectedItem.data.id
        )}
        lesson={selectedItem.data}
        onBack={handleBack}
        onComplete={getCourse}
      />
    );
  }
  if (viewType === "test" && selectedItem) {
    return <TestView test={selectedItem.data} onBack={handleBack} />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {loading && <FullScreenLoader />}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <School sx={{ mr: 2, fontSize: 40, color: "primary.main" }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                {course?.title}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {course?.description}
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
              label={`${course?._count.lessons} Lessons`}
              variant="outlined"
              size="small"
            />
            <Chip
              label={`${userProgress?.completedLessons.length} Completed`}
              variant="outlined"
              size="small"
              color="success"
            />
            <Chip
              label={`${course?._count.tests} Final Tests`}
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
            {courseItems?.map((item, index) => {
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

                  {index < courseItems?.length - 1 && <Divider />}
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
