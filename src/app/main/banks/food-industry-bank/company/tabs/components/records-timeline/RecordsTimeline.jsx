
// import React, { useState, useEffect } from 'react';
// import { 
//   Avatar, 
//   Box, 
//   CircularProgress, 
//   Paper, 
//   Typography, 
//   IconButton,
//   Menu,
//   MenuItem,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button
// } from '@mui/material';
// import { makeStyles } from '@mui/styles';
// import { 
//   Timeline, 
//   TimelineConnector, 
//   TimelineContent, 
//   TimelineDot, 
//   TimelineItem, 
//   TimelineOppositeContent, 
//   TimelineSeparator 
// } from '@mui/lab';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
// import DeleteIcon from '@mui/icons-material/Delete';
// import EditIcon from '@mui/icons-material/Edit';
// import InfiniteScroll from 'react-infinite-scroll-component';
// import { motion } from 'framer-motion';
// import EditorJSComponent from 'app/shared-components/editor-js/EditorJSComponent';
// import { getServerFile } from 'src/utils/string-utils';
// import Output from 'editorjs-react-renderer'; // Import editorjs-react-renderer

// // Styles (RTL and modern design)
// const useStyles = makeStyles((theme) => ({
//   container: {
//     direction: 'rtl',
//     padding: theme.spacing(2),
//   },
//   editorContainer: {
//     marginBottom: theme.spacing(3),
//     padding: theme.spacing(2),
//     background: theme.palette.background.paper,
//     borderRadius: theme.shape.borderRadius,
//   },
//   paper: {
//     padding: theme.spacing(2),
//     borderRadius: '10px',
//     marginBottom: theme.spacing(2),
//     maxWidth: '90%',
//   },
//   timelineContent: {
//     padding: theme.spacing(1),
//   },
//   readMore: {
//     fontWeight: 'bold',
//     color: theme.palette.primary.main,
//     cursor: 'pointer',
//     display: 'inline-block',
//     marginTop: theme.spacing(1),
//   },
//   avatar: {
//     width: theme.spacing(6),
//     height: theme.spacing(6),
//   },
//   spinnerContainer: {
//     textAlign: 'center',
//     padding: theme.spacing(2),
//   },
//   noRecords: {
//     textAlign: 'center',
//     padding: theme.spacing(4),
//     color: theme.palette.text.secondary,
//   },
//   editorOutput: {
//     '& img': {
//       maxWidth: '100%',
//       height: 'auto',
//       borderRadius: 4,
//       marginBottom: theme.spacing(1),
//     },
//     '& h1, & h2, & h3, & h4, & h5, & h6': {
//       marginBottom: theme.spacing(1),
//       marginTop: theme.spacing(2),
//       fontWeight: 'bold',
//       direction: 'rtl',
//     },
//     '& ul, & ol': {
//       paddingRight: theme.spacing(3),
//       marginBottom: theme.spacing(1),
//       marginTop: theme.spacing(1),
//     },
//     '& p': {
//       marginBottom: theme.spacing(1),
//       direction: 'rtl',
//     },
//     '& blockquote': {
//       borderRight: `3px solid ${theme.palette.primary.main}`,
//       paddingRight: theme.spacing(2),
//       marginRight: theme.spacing(1),
//       fontStyle: 'italic',
//       color: theme.palette.text.secondary,
//     },
//     '& a': {
//       color: theme.palette.primary.main,
//       textDecoration: 'none',
//       '&:hover': {
//         textDecoration: 'underline',
//       },
//     },
//     '& table': {
//       width: '100%',
//       borderCollapse: 'collapse',
//       marginBottom: theme.spacing(2),
//       '& th, & td': {
//         border: `1px solid ${theme.palette.divider}`,
//         padding: theme.spacing(1),
//         textAlign: 'right',
//       },
//       '& th': {
//         backgroundColor: theme.palette.action.hover,
//       },
//     },
//     direction: 'rtl',
//     textAlign: 'right',
//   }
// }));

// // Helper function to get plain text from EditorJS data for truncation
// const getPlainTextFromEditorJS = (content) => {
//   if (typeof content === 'string') {
//     try {
//       // Try to parse it as JSON
//       const parsed = JSON.parse(content);
//       if (parsed.blocks && Array.isArray(parsed.blocks)) {
//         return parsed.blocks
//           .map((block) => {
//             switch (block.type) {
//               case 'paragraph':
//                 return block.data.text || '';
//               case 'header':
//                 return block.data.text || '';
//               case 'list':
//                 return (block.data.items || []).join(' ');
//               default:
//                 return '';
//             }
//           })
//           .join(' ');
//       }
//       return content;
//     } catch (e) {
//       // If parsing fails, treat as plain text
//       return content;
//     }
//   }
  
//   if (content && content.blocks && Array.isArray(content.blocks)) {
//     return content.blocks
//       .map((block) => {
//         switch (block.type) {
//           case 'paragraph':
//             return block.data.text || '';
//           case 'header':
//             return block.data.text || '';
//           case 'list':
//             return (block.data.items || []).join(' ');
//           default:
//             return '';
//         }
//       })
//       .join(' ');
//   }
//   return '';
// };

// // Custom configuration for editorjs-react-renderer
// const rendererConfig = {
//   image: {
//     className: 'editor-img',
//     actionsClassNames: {
//       stretched: 'img-fullwidth',
//       withBorder: 'img-with-border',
//       withBackground: 'img-with-background',
//     }
//   },
//   paragraph: {
//     className: 'editor-paragraph',
//     actionsClassNames: {
//       alignment: 'text-align-{alignment}'
//     }
//   },
//   header: {
//     className: 'editor-header',
//   },
//   list: {
//     className: 'editor-list',
//   },
//   table: {
//     className: 'editor-table',
//   }
// };

// // Component for each record card with EditorJS renderer
// const RecordCard = ({ 
//   record, 
//   truncateLength = 200, 
//   onEdit, 
//   onDelete,
//   currentUserRoles = [] 
// }) => {
//   const classes = useStyles();
//   const [expanded, setExpanded] = useState(false);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const menuOpen = Boolean(anchorEl);
  
//   // Parse comment data if it's a string
//   const getCommentData = () => {
//     if (!record.comment) return null;
    
//     if (typeof record.comment === 'string') {
//       try {
//         return JSON.parse(record.comment);
//       } catch (e) {
//         // If parsing fails, return a simple EditorJS structure with text
//         return {
//           blocks: [
//             {
//               type: 'paragraph',
//               data: { text: record.comment }
//             }
//           ]
//         };
//       }
//     }
//     return record.comment;
//   };
  
//   const commentData = getCommentData();
//   const plainText = getPlainTextFromEditorJS(commentData);
//   const needsTruncate = plainText && plainText.length > truncateLength;

//   // Check if the current user has permission to edit/delete this comment
//   const hasEditPermission = () => {
//     // Check if the current user is the author or has admin role
//     if (!record.authorizedRoles || record.authorizedRoles.length === 0) {
//       return true; // Default to true if no roles specified
//     }
    
//     // Check if current user's roles intersect with authorized roles
//     return currentUserRoles.some(role => record.authorizedRoles.includes(role));
//   };

//   const handleMenuClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };

//   const handleMenuClose = () => {
//     setAnchorEl(null);
//   };

//   const handleEdit = () => {
//     handleMenuClose();
//     if (onEdit) onEdit(record);
//   };

//   const handleDelete = () => {
//     handleMenuClose();
//     if (onDelete) onDelete(record.id);
//   };

//   // Create a truncated version of the data for EditorJS renderer
//   const getTruncatedData = () => {
//     if (!commentData || !commentData.blocks || !Array.isArray(commentData.blocks)) {
//       return { blocks: [] };
//     }
    
//     if (!needsTruncate || expanded) {
//       return commentData;
//     }
    
//     // For truncation, either take just the first block or truncate the text
//     let truncatedBlocks = [];
//     let characterCount = 0;
    
//     for (const block of commentData.blocks) {
//       if (characterCount >= truncateLength) break;
      
//       if (block.type === 'paragraph') {
//         const text = block.data.text || '';
//         if (characterCount + text.length > truncateLength) {
//           // Truncate this paragraph
//           truncatedBlocks.push({
//             ...block,
//             data: {
//               ...block.data,
//               text: text.substring(0, truncateLength - characterCount) + '...'
//             }
//           });
//           break;
//         } else {
//           truncatedBlocks.push(block);
//           characterCount += text.length;
//         }
//       } else {
//         // For non-paragraph blocks, just include them until we hit the limit
//         truncatedBlocks.push(block);
//         // Estimate the character count for non-text blocks
//         characterCount += 50;
//       }
//     }
    
//     return {
//       ...commentData,
//       blocks: truncatedBlocks
//     };
//   };

//   return (
//     <TimelineItem>
//       <TimelineOppositeContent>
//         <Typography variant="body2" color="textSecondary">
//           {record.createdAtStr || new Date(record.createdAt).toLocaleString('fa-IR')}
//         </Typography>
//       </TimelineOppositeContent>
//       <TimelineSeparator>
//         <TimelineDot>
//           <Avatar
//             alt={`${record.firstName || ''} ${record.lastName || ''}`}
//             src={getServerFile(record.avatar) || '/assets/images/avatars/profile.jpg'}
//             className={classes.avatar}
//           />
//         </TimelineDot>
//         <TimelineConnector />
//       </TimelineSeparator>
//       <TimelineContent className={classes.timelineContent}>
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3 }}
//         >
//           <Paper elevation={3} className={classes.paper}>
//             <Box display="flex" justifyContent="space-between" alignItems="flex-start">
//               <Box display="flex" flexDirection="column">
//                 <Box display="flex" alignItems="center" mb={1}>
//                   <Typography variant="subtitle1" component="h2" style={{ fontWeight: 'bold', marginRight: 8 }}>
//                     {record.firstName || ''} {record.lastName || ''} 
//                     {record.employeeName && `(${record.employeeName})`}
//                   </Typography>
//                   {(record.roleStr || record.employeeRole) && (
//                     <Typography variant="caption" color="textSecondary">
//                       ({record.roleStr || record.employeeRole})
//                     </Typography>
//                   )}
//                 </Box>
//               </Box>
              
//               {hasEditPermission() && (
//                 <>
//                   <IconButton 
//                     size="small" 
//                     onClick={handleMenuClick}
//                     aria-controls={menuOpen ? "record-menu" : undefined}
//                     aria-haspopup="true"
//                     aria-expanded={menuOpen ? "true" : undefined}
//                   >
//                     <MoreVertIcon />
//                   </IconButton>
//                   <Menu
//                     id="record-menu"
//                     anchorEl={anchorEl}
//                     open={menuOpen}
//                     onClose={handleMenuClose}
//                     MenuListProps={{
//                       'aria-labelledby': 'record-menu-button',
//                     }}
//                   >
//                     <MenuItem onClick={handleEdit}>
//                       <EditIcon fontSize="small" sx={{ mr: 1 }} />
//                       ویرایش
//                     </MenuItem>
//                     <MenuItem onClick={handleDelete}>
//                       <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
//                       حذف
//                     </MenuItem>
//                   </Menu>
//                 </>
//               )}
//             </Box>
            
//             <Box mt={2} className={classes.editorOutput}>
//               {commentData && commentData.blocks && (
//                 <Output data={getTruncatedData()} config={rendererConfig} />
//               )}
              
//               {needsTruncate && !expanded && (
//                 <motion.span
//                   whileHover={{ scale: 1.05 }}
//                   className={classes.readMore}
//                   onClick={() => setExpanded(true)}
//                 >
//                   خواندن بیشتر
//                 </motion.span>
//               )}
//               {needsTruncate && expanded && (
//                 <motion.span
//                   whileHover={{ scale: 1.05 }}
//                   className={classes.readMore}
//                   onClick={() => setExpanded(false)}
//                 >
//                   نمایش کمتر
//                 </motion.span>
//               )}
//             </Box>
//           </Paper>
//         </motion.div>
//       </TimelineContent>
//     </TimelineItem>
//   );
// };

// // Main RecordsTimeline component
// const RecordsTimeline = ({ 
//   records = [], 
//   loading = false,
//   hasMore = false,
//   onLoadMore,
//   onAddComment,
//   onEditComment,
//   onDeleteComment,
//   editorComponent = null, 
//   classes: propClasses = {},
//   currentUserRoles = [],
//   entityType,
//   entityId
// }) => {
//   const classes = useStyles();
//   const [editingComment, setEditingComment] = useState(null);
//   const [editDialogOpen, setEditDialogOpen] = useState(false);
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [commentToDelete, setCommentToDelete] = useState(null);
//   const [editorLoading, setEditorLoading] = useState(false);

//   // Parse comment data from string if needed
//   const parseCommentData = (comment) => {
//     if (typeof comment === 'string') {
//       try {
//         return JSON.parse(comment);
//       } catch (e) {
//         // If parsing fails, return minimal valid structure
//         return { 
//           blocks: [{ 
//             type: 'paragraph', 
//             data: { text: comment } 
//           }] 
//         };
//       }
//     }
//     return comment;
//   };

//   const handleEdit = (comment) => {
//     // Parse the comment data if it's a string
//     if (comment.comment && typeof comment.comment === 'string') {
//       comment.comment = parseCommentData(comment.comment);
//     }
    
//     setEditingComment(comment);
//     setEditDialogOpen(true);
//   };

//   const handleDelete = (commentId) => {
//     setCommentToDelete(commentId);
//     setDeleteDialogOpen(true);
//   };

//   const handleSaveEdit = async (editorData) => {
//     setEditorLoading(true);
//     try {
//       if (onEditComment) {
//         await onEditComment({
//           id: editingComment.id, 
//           commentData: {
//             ...editingComment,
//             comment: editorData
//           }
//         });
//       }
//       setEditDialogOpen(false);
//     } catch (error) {
//       console.error("Error updating comment:", error);
//     } finally {
//       setEditorLoading(false);
//     }
//   };

//   const handleConfirmDelete = async () => {
//     try {
//       if (onDeleteComment && commentToDelete) {
//         await onDeleteComment(commentToDelete);
//       }
//     } catch (error) {
//       console.error("Error deleting comment:", error);
//     } finally {
//       setDeleteDialogOpen(false);
//       setCommentToDelete(null);
//     }
//   };

//   return (
//     <Box className={`${classes.container} ${propClasses.container || ''}`}>
//       {editorComponent && (
//         <div className={`${classes.editorContainer} ${propClasses.editorContainer || ''}`}>
//           {editorComponent}
//         </div>
//       )}
      
//       {records.length === 0 && !loading ? (
//         <Typography variant="body1" className={classes.noRecords}>
//           هیچ رکوردی یافت نشد. با استفاده از ادیتور بالا، اولین نظر را ثبت کنید.
//         </Typography>
//       ) : (
//         <InfiniteScroll
//           dataLength={records.length}
//           next={onLoadMore}
//           hasMore={hasMore}
//           loader={
//             <Box className={classes.spinnerContainer}>
//               <CircularProgress />
//             </Box>
//           }
//           endMessage={
//             <Typography align="center" variant="body2" color="textSecondary">
//               رکورد دیگری برای نمایش وجود ندارد
//             </Typography>
//           }
//         >
//           <Timeline align="alternate">
//             {records.map((record) => (
//               <RecordCard 
//                 key={record.id} 
//                 record={record}
//                 onEdit={handleEdit}
//                 onDelete={handleDelete}
//                 currentUserRoles={currentUserRoles}
//               />
//             ))}
//           </Timeline>
//         </InfiniteScroll>
//       )}

//       {/* Edit Comment Dialog */}
//       <Dialog
//         open={editDialogOpen}
//         onClose={() => setEditDialogOpen(false)}
//         maxWidth="md"
//         fullWidth
//       >
//         <DialogTitle>ویرایش نظر</DialogTitle>
//         <DialogContent>
//           {editingComment && (
//             <EditorJSComponent
//               initialData={editingComment.comment}
//               onSave={handleSaveEdit}
//               loading={editorLoading}
//               buttonText="ذخیره تغییرات"
//             />
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setEditDialogOpen(false)} color="primary">
//             انصراف
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <Dialog
//         open={deleteDialogOpen}
//         onClose={() => setDeleteDialogOpen(false)}
//       >
//         <DialogTitle>تایید حذف</DialogTitle>
//         <DialogContent>
//           <Typography variant="body1">
//             آیا از حذف این نظر اطمینان دارید؟ این عملیات قابل بازگشت نیست.
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
//             انصراف
//           </Button>
//           <Button onClick={handleConfirmDelete} color="error">
//             حذف
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default RecordsTimeline;

import React, { useState, useEffect } from 'react';
import { 
  Avatar, 
  Box, 
  CircularProgress, 
  Paper, 
  Typography, 
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { 
  Timeline, 
  TimelineConnector, 
  TimelineContent, 
  TimelineDot, 
  TimelineItem, 
  TimelineOppositeContent, 
  TimelineSeparator 
} from '@mui/lab';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InfiniteScroll from 'react-infinite-scroll-component';
import { motion } from 'framer-motion';
import EditorJSComponent from 'app/shared-components/editor-js/EditorJSComponent';
import { getServerFile } from 'src/utils/string-utils';
import Output from 'editorjs-react-renderer';
import {format} from "date-fns-jalali"; // Import editorjs-react-renderer

function formatDateJalali(dateString) {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), 'yyyy/MM/dd - HH:mm');
  } catch {
    return dateString;
  }
}
// Enhanced styles for RTL support
const useStyles = makeStyles((theme) => ({
  container: {
    direction: 'rtl',
    padding: theme.spacing(2),
  },
  editorContainer: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    direction: 'rtl',
  },
  paper: {
    padding: theme.spacing(2),
    borderRadius: '10px',
    marginBottom: theme.spacing(2),
    maxWidth: '90%',
    direction: 'rtl',
  },
  timelineContent: {
    padding: theme.spacing(1),
  },
  readMore: {
    fontWeight: 'bold',
    color: theme.palette.primary.main,
    cursor: 'pointer',
    display: 'inline-block',
    marginTop: theme.spacing(1),
    direction: 'rtl',
  },
  avatar: {
    width: theme.spacing(6),
    height: theme.spacing(6),
  },
  spinnerContainer: {
    textAlign: 'center',
    padding: theme.spacing(2),
  },
  noRecords: {
    textAlign: 'center',
    padding: theme.spacing(4),
    color: theme.palette.text.secondary,
    direction: 'rtl',
  },
  editorOutput: {
    '& img': {
      maxWidth: '100%',
      height: 'auto',
      borderRadius: 4,
      marginBottom: theme.spacing(1),
    },
    '& h1, & h2, & h3, & h4, & h5, & h6': {
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(2),
      fontWeight: 'bold',
      direction: 'rtl',
      textAlign: 'right',
    },
    '& ul, & ol': {
      paddingRight: theme.spacing(3),
      paddingLeft: 0, // Override default left padding
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(1),
      direction: 'rtl',
      textAlign: 'right',
    },
    '& li': {
      textAlign: 'right',
      direction: 'rtl',
    },
    '& p': {
      marginBottom: theme.spacing(1),
      direction: 'rtl',
      textAlign: 'right',
    },
    '& blockquote': {
      borderRight: `3px solid ${theme.palette.primary.main}`,
      borderLeft: 'none', // Remove any left border
      paddingRight: theme.spacing(2),
      paddingLeft: 0, // Remove any left padding
      marginRight: theme.spacing(1),
      marginLeft: 0, // Remove any left margin
      fontStyle: 'italic',
      color: theme.palette.text.secondary,
      direction: 'rtl',
      textAlign: 'right',
    },
    '& a': {
      color: theme.palette.primary.main,
      textDecoration: 'none',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    '& table': {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: theme.spacing(2),
      direction: 'rtl',
      '& th, & td': {
        border: `1px solid ${theme.palette.divider}`,
        padding: theme.spacing(1),
        textAlign: 'right',
      },
      '& th': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    direction: 'rtl',
    textAlign: 'right',
  },
  // Add specific class for the renderer
  editorjsRenderer: {
    direction: 'rtl',
    textAlign: 'right',
    '& *': {
      direction: 'rtl',
      textAlign: 'right',
    }
  }
}));

// Helper function to get plain text from EditorJS data for truncation
const getPlainTextFromEditorJS = (content) => {
  if (typeof content === 'string') {
    try {
      // Try to parse it as JSON
      const parsed = JSON.parse(content);
      if (parsed.blocks && Array.isArray(parsed.blocks)) {
        return parsed.blocks
          .map((block) => {
            switch (block.type) {
              case 'paragraph':
                return block.data.text || '';
              case 'header':
                return block.data.text || '';
              case 'list':
                return (block.data.items || []).join(' ');
              default:
                return '';
            }
          })
          .join(' ');
      }
      return content;
    } catch (e) {
      // If parsing fails, treat as plain text
      return content;
    }
  }
  
  if (content && content.blocks && Array.isArray(content.blocks)) {
    return content.blocks
      .map((block) => {
        switch (block.type) {
          case 'paragraph':
            return block.data.text || '';
          case 'header':
            return block.data.text || '';
          case 'list':
            return (block.data.items || []).join(' ');
          default:
            return '';
        }
      })
      .join(' ');
  }
  return '';
};

// Custom configuration for editorjs-react-renderer with RTL support
const rendererConfig = {
  image: {
    className: 'editor-img',
    actionsClassNames: {
      stretched: 'img-fullwidth',
      withBorder: 'img-with-border',
      withBackground: 'img-with-background',
    }
  },
  paragraph: {
    className: 'editor-paragraph rtl-paragraph',
    actionsClassNames: {
      alignment: 'text-align-{alignment}'
    }
  },
  header: {
    className: 'editor-header rtl-header',
  },
  list: {
    className: 'editor-list rtl-list',
  },
  table: {
    className: 'editor-table rtl-table',
  }
};

// Component for each record card with EditorJS renderer and RTL support
const RecordCard = ({ 
  record, 
  truncateLength = 200, 
  onEdit, 
  onDelete,
  currentUserRoles = [] 
}) => {
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);
  
  // Parse comment data if it's a string
  const getCommentData = () => {
    if (!record.comment) return null;
    
    if (typeof record.comment === 'string') {
      try {
        return JSON.parse(record.comment);
      } catch (e) {
        // If parsing fails, return a simple EditorJS structure with text
        return {
          blocks: [
            {
              type: 'paragraph',
              data: { text: record.comment }
            }
          ]
        };
      }
    }
    return record.comment;
  };
  
  const commentData = getCommentData();
  const plainText = getPlainTextFromEditorJS(commentData);
  const needsTruncate = plainText && plainText.length > truncateLength;

  // Check if the current user has permission to edit/delete this comment
  const hasEditPermission = () => {
    // Check if the current user is the author or has admin role
    if (!record.authorizedRoles || record.authorizedRoles.length === 0) {
      return true; // Default to true if no roles specified
    }
    
    // Check if current user's roles intersect with authorized roles
    return currentUserRoles.some(role => record.authorizedRoles.includes(role));
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    if (onEdit) onEdit(record);
  };

  const handleDelete = () => {
    handleMenuClose();
    if (onDelete) onDelete(record.id);
  };

  // Create a truncated version of the data for EditorJS renderer
  const getTruncatedData = () => {
    if (!commentData || !commentData.blocks || !Array.isArray(commentData.blocks)) {
      return { blocks: [] };
    }
    
    if (!needsTruncate || expanded) {
      return commentData;
    }
    
    // For truncation, either take just the first block or truncate the text
    let truncatedBlocks = [];
    let characterCount = 0;
    
    for (const block of commentData.blocks) {
      if (characterCount >= truncateLength) break;
      
      if (block.type === 'paragraph') {
        const text = block.data.text || '';
        if (characterCount + text.length > truncateLength) {
          // Truncate this paragraph
          truncatedBlocks.push({
            ...block,
            data: {
              ...block.data,
              text: text.substring(0, truncateLength - characterCount) + '...'
            }
          });
          break;
        } else {
          truncatedBlocks.push(block);
          characterCount += text.length;
        }
      } else {
        // For non-paragraph blocks, just include them until we hit the limit
        truncatedBlocks.push(block);
        // Estimate the character count for non-text blocks
        characterCount += 50;
      }
    }
    
    return {
      ...commentData,
      blocks: truncatedBlocks
    };
  };

  // Custom renderers for editorjs-react-renderer with RTL support
  const customRenderers = {
    paragraph: ({ data, className }) => (
      <p 
        className={className} 
        style={{ 
          direction: 'rtl', 
          textAlign: 'right' 
        }}
        dangerouslySetInnerHTML={{ __html: data.text }}
      />
    ),
    header: ({ data, className }) => {
      const TagName = `h${data.level}`;
      return (
        <TagName 
          className={className}
          style={{ 
            direction: 'rtl', 
            textAlign: 'right' 
          }}
          dangerouslySetInnerHTML={{ __html: data.text }}
        />
      );
    },
    list: ({ data, className }) => {
      const Tag = data.style === 'ordered' ? 'ol' : 'ul';
      return (
        <Tag className={className} style={{ direction: 'rtl', textAlign: 'right' }}>
          {data.items.map((item, i) => (
            <li 
              key={i} 
              style={{ textAlign: 'right' }}
              dangerouslySetInnerHTML={{ __html: item }}
            />
          ))}
        </Tag>
      );
    },
    table: ({ data, className }) => (
      <table className={className} style={{ direction: 'rtl' }}>
        {data.content.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td 
                key={j} 
                style={{ textAlign: 'right' }}
                dangerouslySetInnerHTML={{ __html: cell }}
              />
            ))}
          </tr>
        ))}
      </table>
    ),
    image: ({ data, className }) => (
      <div className={className} style={{ textAlign: 'right' }}>
        <img 
          src={data.file.url} 
          alt={data.caption || ''} 
          style={{ maxWidth: '100%' }} 
        />
        {data.caption && (
          <div style={{ direction: 'rtl', textAlign: 'right' }}>
            {data.caption}
          </div>
        )}
      </div>
    )
  };

  return (
    <TimelineItem>
      <TimelineOppositeContent>
        <Typography variant="body2" color="textSecondary">
          {formatDateJalali(record.createdAt) || new Date(record.createdAt).toLocaleString('fa-IR')}
        </Typography>
      </TimelineOppositeContent>
      <TimelineSeparator>
        <TimelineDot>
          <Avatar
            alt={`${record.firstName || ''} ${record.lastName || ''}`}
            src={getServerFile(record.avatar) || '/assets/images/avatars/profile.jpg'}
            className={classes.avatar}
          />
        </TimelineDot>
        <TimelineConnector />
      </TimelineSeparator>
      <TimelineContent className={classes.timelineContent}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper elevation={3} className={classes.paper}>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="flex-start"
              sx={{ direction: 'ltr' }}
            >
              <Box display="flex" flexDirection="column">
                <Box display="flex" alignItems="center" mb={1}>
                  <Typography 
                    variant="subtitle1" 
                    component="h2" 
                    style={{ 
                      fontWeight: 'bold', 
                      marginLeft: 8, // Changed from marginRight to marginLeft for RTL
                      direction: 'rtl',
                      textAlign: 'right'
                    }}
                  >
                    {record.firstName || ''} {record.lastName || ''} 
                    {/* {record.employeeName && `(${record.employeeName})`} */}
                  </Typography>
                  {(record.roleStr || record.employeeRole) && (
                    <Typography 
                      variant="caption" 
                      color="textSecondary"
                      style={{ 
                        direction: 'rtl',
                        textAlign: 'right'
                      }}
                    >
                      ({record.roleStr || record.employeeRole})
                    </Typography>
                  )}
                </Box>
              </Box>
              
              {hasEditPermission() && (
                <>
                  <IconButton 
                    size="small" 
                    onClick={handleMenuClick}
                    aria-controls={menuOpen ? "record-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={menuOpen ? "true" : undefined}
                  >
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    id="record-menu"
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                    MenuListProps={{
                      'aria-labelledby': 'record-menu-button',
                    }}
                  >
                    {/* <MenuItem onClick={handleEdit}> */}
                      {/* <EditIcon fontSize="small" sx={{ ml: 1 }} /> {/* Changed from mr to ml for RTL */}
                      {/* ویرایش */}
                    {/* </MenuItem> */} 
                    <MenuItem onClick={handleDelete}>
                      <DeleteIcon fontSize="small" sx={{ ml: 1 }} /> {/* Changed from mr to ml for RTL */}
                      حذف
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
            
            <Box 
              mt={2} 
              className={classes.editorOutput}
              sx={{ direction: 'rtl', textAlign: 'right' }}
            >
              {commentData && commentData.blocks && (
                <div style={{ direction: 'rtl', textAlign: 'right' }} className={classes.editorjsRenderer}>
                  <Output 
                    data={getTruncatedData()} 
                    config={rendererConfig} 
                    renderers={customRenderers}
                    style={{ direction: 'rtl', textAlign: 'right' }}
                  />
                </div>
              )}
              
              {needsTruncate && !expanded && (
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={classes.readMore}
                  onClick={() => setExpanded(true)}
                  style={{ direction: 'rtl', textAlign: 'right', display: 'block' }}
                >
                  خواندن بیشتر
                </motion.span>
              )}
              {needsTruncate && expanded && (
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={classes.readMore}
                  onClick={() => setExpanded(false)}
                  style={{ direction: 'rtl', textAlign: 'right', display: 'block' }}
                >
                  نمایش کمتر
                </motion.span>
              )}
            </Box>
          </Paper>
        </motion.div>
      </TimelineContent>
    </TimelineItem>
  );
};

// Main RecordsTimeline component with RTL support
const RecordsTimeline = ({ 
  records = [], 
  loading = false,
  hasMore = false,
  onLoadMore,
  onAddComment,
  onEditComment,
  onDeleteComment,
  editorComponent = null, 
  classes: propClasses = {},
  currentUserRoles = [],
  entityType,
  entityId
}) => {
  const classes = useStyles();
  const [editingComment, setEditingComment] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [editorLoading, setEditorLoading] = useState(false);

  // Parse comment data from string if needed
  const parseCommentData = (comment) => {
    if (typeof comment === 'string') {
      try {
        return JSON.parse(comment);
      } catch (e) {
        // If parsing fails, return minimal valid structure
        return { 
          blocks: [{ 
            type: 'paragraph', 
            data: { text: comment } 
          }] 
        };
      }
    }
    return comment;
  };

  const handleEdit = (comment) => {
    // Parse the comment data if it's a string
    if (comment.comment && typeof comment.comment === 'string') {
      comment.comment = parseCommentData(comment.comment);
    }
    
    setEditingComment(comment);
    setEditDialogOpen(true);
  };

  const handleDelete = (commentId) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const handleSaveEdit = async (editorData) => {
    setEditorLoading(true);
    try {
      if (onEditComment) {
        await onEditComment({
          id: editingComment.id, 
          commentData: {
            ...editingComment,
            comment: editorData
          }
        });
      }
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setEditorLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (onDeleteComment && commentToDelete) {
        await onDeleteComment(commentToDelete);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  return (
    <Box className={`${classes.container} ${propClasses.container || ''}`}>
      {editorComponent && (
        <div className={`${classes.editorContainer} ${propClasses.editorContainer || ''}`}>
          {editorComponent}
        </div>
      )}
      
      {records.length === 0 && !loading ? (
        <Typography 
          variant="body1" 
          className={classes.noRecords}
          style={{ direction: 'rtl', textAlign: 'center' }}
        >
          هیچ رکوردی یافت نشد. با استفاده از ادیتور بالا، اولین نظر را ثبت کنید.
        </Typography>
      ) : (
        <InfiniteScroll
          dataLength={records.length}
          next={onLoadMore}
          hasMore={hasMore}
          loader={
            <Box className={classes.spinnerContainer}>
              <CircularProgress />
            </Box>
          }
          endMessage={
            <Typography 
              align="center" 
              variant="body2" 
              color="textSecondary"
              style={{ direction: 'rtl' }}
            >
              رکورد دیگری برای نمایش وجود ندارد
            </Typography>
          }
        >
          <Timeline align="alternate">
            {records.map((record) => (
              <RecordCard 
                key={record.id} 
                record={record}
                onEdit={handleEdit}
                onDelete={handleDelete}
                currentUserRoles={currentUserRoles}
              />
            ))}
          </Timeline>
        </InfiniteScroll>
      )}

      {/* Edit Comment Dialog with RTL support */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle style={{ direction: 'rtl', textAlign: 'right' }}>
          ویرایش نظر
        </DialogTitle>
        <DialogContent>
          {editingComment && (
            <div style={{ direction: 'rtl' }}>
              <EditorJSComponent
                initialData={editingComment.comment}
                onSave={handleSaveEdit}
                loading={editorLoading}
                buttonText="ذخیره تغییرات"
              />
            </div>
          )}
        </DialogContent>
        <DialogActions style={{ direction: 'rtl', justifyContent: 'flex-start' }}>
          <Button onClick={() => setEditDialogOpen(false)} color="primary">
            انصراف
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog with RTL support */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle style={{ direction: 'rtl', textAlign: 'right' }}>
          تایید حذف
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" style={{ direction: 'rtl', textAlign: 'right' }}>
            آیا از حذف این نظر اطمینان دارید؟ این عملیات قابل بازگشت نیست.
          </Typography>
        </DialogContent>
        <DialogActions style={{ direction: 'rtl', justifyContent: 'flex-start' }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            انصراف
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            حذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecordsTimeline;