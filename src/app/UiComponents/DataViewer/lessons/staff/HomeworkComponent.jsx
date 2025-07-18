import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  useTheme
} from '@mui/material';
import { FiBookOpen, FiVideo, FiFileText, FiUpload, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { getDataAndSet } from '@/app/helpers/functions/getDataAndSet';
import SimpleFileInput from '@/app/UiComponents/formComponents/SimpleFileInput';
import { useToastContext } from '@/app/providers/ToastLoadingProvider';
import { handleRequestSubmit } from '@/app/helpers/functions/handleSubmit';
import LoadingOverlay from '@/app/UiComponents/feedback/loaders/LoadingOverlay';

const HomeworkComponent = ({courseId,lessonId,onUpdate,lessonProgress}) => {
  const [homeworkDialog, setHomeworkDialog] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [homeworks, setHomeworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const {toastLoading:submitting,setToastLoading:setSubmitting}=useToastContext()
  const theme=useTheme()
  useEffect(() => {
    fetchHomeworks();
  }, []);
  const fetchHomeworks = async () => {
    await getDataAndSet({url:`shared/courses/${courseId}/lessons/${lessonId}/home-work`,setData:setHomeworks,setLoading})
  };

  const handleUploadClick = (type) => {
    setUploadType(type);
    setUploadDialog(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !file) {
      return;
    }
     let url=""
      const fileformData = new FormData();
      fileformData.append("file", file.file);
      const uploadResponse = await handleRequestSubmit(
        fileformData,
        setSubmitting,
        "utility/upload",
        true,
        "Uploading file"
      );
      if(uploadResponse.status===200){
        url= uploadResponse.fileUrls.file[0];
      }


      const req=await handleRequestSubmit({url,title,type:uploadType},setSubmitting,`shared/courses/${courseId}/lessons/${lessonId}/home-work`)
      if(req.status===200){
        onUpdate()
        handleCloseUploadDialog()
        await fetchHomeworks()
      }
    }




  const handleCloseUploadDialog = () => {
    setUploadDialog(false);
    setTitle('');
    setFile(null);
  };

  const videoHomeworks = homeworks.filter(hw => hw.type === 'VIDEO');
  const summaryHomeworks = homeworks.filter(hw => hw.type === 'SUMMARY');
  const hasVideo = videoHomeworks.length > 0;
  const hasSummary = summaryHomeworks.length > 0;
  const canProceed = hasVideo && hasSummary;


  return (
      <Box>
        {/* Header Section */}
        <Box  sx={{display:'flex',flexDirection:"column",gap:1}}>
                <Typography variant="subtitle2" >
                          Lesson Progress: {lessonProgress}
                        </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<FiBookOpen />}
            sx={{width:"fit-content"}}
            onClick={() => setHomeworkDialog(true)}
          >
            Open Homework
          </Button>
              <Alert severity={canProceed ? "success" : "warning"} sx={{ mb: 3 }}>
              {canProceed 
                ? "Great! You've completed all homework requirements and can proceed to the next lesson."
                : "You must finish your homework in order to go to the next lesson or test."
              }
            </Alert>
        </Box>

        <Dialog open={homeworkDialog} onClose={() => setHomeworkDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FiBookOpen size={24} />
              Homework Requirements
            </Box>
          </DialogTitle>
          <DialogContent sx={{position:"relative"}}>
            {loading&&<LoadingOverlay/>}
            <Alert severity={canProceed ? "success" : "warning"} sx={{ mb: 3 }}>
              {canProceed 
                ? "Great! You've completed all homework requirements and can proceed to the next lesson."
                : "You must finish your homework in order to go to the next lesson or test."
              }
            </Alert>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              You must upload at least one file for video and one file for summary to complete this lesson.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<FiVideo />}
                onClick={() => handleUploadClick('VIDEO')}
                color="primary"
                size="large"
              >
                Upload Video Homework
              </Button>
              <Button
                variant="contained"
                startIcon={<FiFileText />}
                onClick={() => handleUploadClick('SUMMARY')}
                color="secondary"
                size="large"
              >
                Upload Summary Homework
              </Button>
            </Box>
                <Grid container spacing={3} sx={{ my: 2 }}>
          <Grid size={{md:4}}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FiVideo size={24} color={theme.palette.primary.main} />
                  <Box>
                    <Typography variant="h6">{videoHomeworks.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Video Homeworks
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{md:4}}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FiFileText size={24} color={theme.palette.secondary.main} />
                  <Box>
                    <Typography variant="h6">{summaryHomeworks.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Summary Homeworks
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid size={{md:4}}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {canProceed ? (
                    <FiCheck size={24} color={theme.palette.success.main} />
                  ) : (
                    <FiAlertCircle size={24} color={theme.palette.warning.main} />
                  )}
                  <Box>
                    <Typography variant="h6">
                      {canProceed ? 'Ready' : 'Pending'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Next Lesson Status
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
           <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Your Homework Submissions
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : homeworks.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No homework submitted yet
            </Typography>
          ) : (
            <List>
              {homeworks.map((homework, index) => (
                <React.Fragment key={homework.id}>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      {homework.type === 'VIDEO' ? (
                        <FiVideo size={20} color={theme.palette.primary.main} />
                      ) : (
                        <FiFileText size={20} color={theme.palette.secondary.main} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={homework.title}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                          <Chip
                            label={homework.type}
                            size="small"
                            color={homework.type === 'VIDEO' ? 'primary' : 'secondary'}
                            variant="outlined"
                          />
                     <Button component="a" target='_blank' href={homework.url} variant='outlined'>
Open link
                     </Button>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < homeworks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setHomeworkDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Upload Dialog */}
        <Dialog open={uploadDialog} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FiUpload size={24} />
              Upload {uploadType === 'VIDEO' ? 'Video' : 'Summary'} Homework
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ mb: 3 }}
                required
              />
              <SimpleFileInput 
              
            id="file"
            setData={setFile}
            label={uploadType==="VIDEO"?"Upload a video":"Upload a file"}
            input={{accept:uploadType === 'VIDEO' ? 'video/*' : 'application/pdf'}}
              />
    
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUploadDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!title.trim() || !file || submitting}
              startIcon={submitting ? <CircularProgress size={16} /> : <FiUpload />}
            >
              {submitting ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default HomeworkComponent;