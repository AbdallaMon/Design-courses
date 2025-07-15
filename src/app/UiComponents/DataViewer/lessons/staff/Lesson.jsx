import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  Link,
  IconButton,
  Divider,
  Grid,
  Paper,
  LinearProgress,
  Alert,
  Container,
} from "@mui/material";
import {
  MdExpandMore as ExpandMore,
  MdPlayArrow as PlayArrow,
  MdPictureAsPdf as PictureAsPdf,
  MdLink as LinkIcon,
  MdQuiz as Quiz,
  MdTimer as Timer,
  MdCheckCircle as CheckCircle,
  MdOpenInNew as OpenInNew,
} from "react-icons/md";

import { FaPlay, FaFilePdf, FaExternalLinkAlt } from "react-icons/fa";
import FullScreenLoader from "@/app/UiComponents/feedback/loaders/FullscreenLoader";
import { getDataAndSet } from "@/app/helpers/functions/getDataAndSet";
import { useAuth } from "@/app/providers/AuthProvider";
import { handleRequestSubmit } from "@/app/helpers/functions/handleSubmit";
import { useToastContext } from "@/app/providers/ToastLoadingProvider";

const LessonComponent = ({ lessonId, isCompleted, courseId, onComplete }) => {
  const [completed, setCompleted] = useState(isCompleted);
  const [expandedSection, setExpandedSection] = useState("videos");
  const [lesson, setLesson] = useState();
  const [loading, setLoading] = useState(false);
  const { setToastLoading } = useToastContext();
  const { user } = useAuth();
  async function getLesson() {
    await getDataAndSet({
      url: `shared/courses/${courseId}/lessons/${lessonId}?role=${user.role}&`,
      setLoading,
      setData: setLesson,
    });
  }
  useEffect(() => {
    if (lessonId) {
      getLesson();
    }
  }, [lessonId]);
  const handleSectionChange = (section) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? section : false);
  };
  function calculateProgress() {
    return completed ? "COMPLETED" : "IN PROGRESS";
  }
  async function markLessonAsCompleted() {
    const req = await handleRequestSubmit(
      {},
      setToastLoading,
      `shared/courses/${courseId}/lessons/${lesson.id}`,
      false,
      "Updating",
      false,
      "PATCH"
    );
    if (req.status === 200) {
      onComplete();
      setCompleted(true);
    }
  }
  const renderVideo = (video) => {
    if (video.videoType === "IFRAME") {
      return (
        <Box sx={{ mb: 2 }}>
          <Paper elevation={2} sx={{ overflow: "hidden", borderRadius: 2 }}>
            <Box
              sx={{ position: "relative", paddingBottom: "56.25%", height: 0 }}
            >
              <iframe
                src={video.url}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: "none",
                }}
                allowFullScreen
                title={`Video ${video.order + 1}`}
              />
            </Box>
          </Paper>
        </Box>
      );
    } else {
      return (
        <Box sx={{ mb: 2 }}>
          <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <FaPlay style={{ marginRight: 8, color: "#1976d2" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: "medium" }}>
                Video {video.order + 1}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              endIcon={<OpenInNew />}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              fullWidth
              sx={{ mt: 1 }}
            >
              Watch Video
            </Button>
          </Paper>
        </Box>
      );
    }
  };

  const renderPDF = (pdf, index) => (
    <Box key={pdf.id} sx={{ mb: 2 }}>
      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <FaFilePdf
              style={{ marginRight: 8, color: "#d32f2f", fontSize: 20 }}
            />
            <Typography variant="subtitle1">
              PDF Document {index + 1}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            endIcon={<OpenInNew />}
            href={pdf.url}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
          >
            Open PDF
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  const renderLink = (link) => (
    <Box key={link.id} sx={{ mb: 2 }}>
      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <FaExternalLinkAlt
              style={{ marginRight: 8, color: "#1976d2", fontSize: 16 }}
            />
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              {link.title}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<LinkIcon />}
            endIcon={<OpenInNew />}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
          >
            Visit Link
          </Button>
        </Box>
      </Paper>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ p: 0 }}>
      {loading && <FullScreenLoader />}
      {!lesson && !loading && (
        <Alert severity="error">
          You are not allowed to access this lesson
        </Alert>
      )}
      {lesson && (
        <>
          {" "}
          <Paper
            elevation={3}
            sx={{ p: 3, px: { xs: 1, md: 3 }, mb: 3, borderRadius: 2 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
              }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{ fontWeight: "bold", mb: 1 }}
                >
                  {lesson.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {lesson.description}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip
                  icon={<Timer />}
                  label={`${lesson.duration} min`}
                  color="primary"
                />
              </Box>
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Lesson Progress: {calculateProgress()}
              </Typography>
              {!completed && (
                <Button variant="outlined" onClick={markLessonAsCompleted}>
                  Mark as completed
                </Button>
              )}
            </Box>
          </Paper>
          {/* Lesson Content Sections */}
          <Box sx={{ mb: 3 }}>
            {/* Videos Section */}
            {lesson.videos.length > 0 && (
              <Accordion
                expanded={expandedSection === "videos"}
                onChange={handleSectionChange("videos")}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FaPlay style={{ color: "#1976d2" }} />
                    <Typography variant="h6">
                      Videos ({lesson.videos.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    {lesson.videos
                      .sort((a, b) => a.order - b.order)
                      .map((video) => renderVideo(video))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {/* PDFs Section */}
            {lesson.pdfs.length > 0 && (
              <Accordion
                expanded={expandedSection === "pdfs"}
                onChange={handleSectionChange("pdfs")}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FaFilePdf style={{ color: "#d32f2f" }} />
                    <Typography variant="h6">
                      PDF Resources ({lesson.pdfs.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    {lesson.pdfs
                      .sort((a, b) => a.order - b.order)
                      .map((pdf, index) => renderPDF(pdf, index))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Links Section */}
            {lesson.links.length > 0 && (
              <Accordion
                expanded={expandedSection === "links"}
                onChange={handleSectionChange("links")}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FaExternalLinkAlt style={{ color: "#1976d2" }} />
                    <Typography variant="h6">
                      Additional Links ({lesson.links.length})
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    {lesson.links
                      .sort((a, b) => a.order - b.order)
                      .map((link) => renderLink(link))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
          {/* Completion Alert */}
          {calculateProgress() === "COMPLETE" && (
            <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Congratulations! You've completed this lesson.
              </Typography>
              <Typography variant="body2">
                You can now proceed to the next lesson or review the content
                anytime.
              </Typography>
            </Alert>
          )}
        </>
      )}
    </Container>
  );
};

export default LessonComponent;
