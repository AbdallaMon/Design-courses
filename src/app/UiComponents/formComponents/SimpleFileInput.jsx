import { Alert, Box, Button, Link, Snackbar, TextField } from "@mui/material";
import { useState } from "react";

export default function SimpleFileInput({
  input,
  id,
  label,
  variant = "filled",
  setData,
  handleUpload,
  helperText = "Max file uploads : 80mb",
}) {
  const [preview, setPreview] = useState();
  const [fileName, setFileName] = useState(""); // Track file name
  const [error, setError] = useState(null); // Track file error
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const MAX_FILE_SIZE = 80 * 1024 * 1024;
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds the 80MB limit.`);
      setPreview(null);
      setFileName("");
      return;
    }
    setError(null);

    const accept = input?.accept || null;
    const fileType = file.type;

    const isVideo = accept?.includes("video/*");
    const isImage = accept?.includes("image/*");
    const isPdf = accept?.includes("application/pdf");

    const isAccepted =
      !accept ||
      (isVideo && fileType.startsWith("video/")) ||
      (isImage && fileType.startsWith("image/")) ||
      (isPdf && fileType === "application/pdf");

    if (!isAccepted) {
      const allowedTypes = [];
      if (isVideo) allowedTypes.push("Videos");
      if (isImage) allowedTypes.push("Images");
      if (isPdf) allowedTypes.push("PDFs");

      setError(
        `File type not allowed. Allowed types: ${allowedTypes.join(", ")}.`
      );
      setPreview(null);
      setFileName("");
      return;
    }
    if (file) {
      setFileName(file.name); // Store file name
      const reader = new FileReader();
      const fileBlob = URL.createObjectURL(file);
      setPreview(fileBlob);
      if (setData) {
        setData((old) => ({ ...old, [id]: file }));
      }
      if (handleUpload) {
        handleUpload(file);
      }
    } else {
      setPreview(null);
    }
  };
  const renderPreview = () => {
    if (!preview) return null;
    return (
      <Link sx={{}} href={preview} target="_blank" rel="noopener noreferrer">
        {fileName || "Show file"}
      </Link>
    );
  };

  return (
    <>
      <Box display="flex" gap={2}>
        <TextField
          label={label}
          id={id}
          sx={(theme) => ({
            backgroundColor:
              variant === "outlined"
                ? theme.palette.background.default
                : "inherit",
          })}
          type="file"
          variant={variant}
          helperText={helperText}
          fullWidth
          accept={input?.accept}
          slotProps={{
            htmlInput: {
              accept: input?.accept ?? "image/*",
            },

            inputLabel: { shrink: true },
          }}
          onChange={(e) => {
            handleFileChange(e);
          }}
        />
        {renderPreview()}
      </Box>
      {error && (
        <Snackbar
          open={error}
          autoHideDuration={2000}
          onClose={() => setError(null)}
        >
          <Alert
            onClose={() => setError(null)}
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
          >
            {error}
          </Alert>
        </Snackbar>
      )}
    </>
  );
}
