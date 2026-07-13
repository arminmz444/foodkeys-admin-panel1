"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material"
import {
  Email as EmailIcon,
  Sms as SmsIcon,
  Webhook as WebhookIcon,
  Code as CodeIcon,
  Api as ApiIcon,
  DataObject as DataObjectIcon,
  Close as CloseIcon,
} from "@mui/icons-material"
import SimpleCodeEditor from "@/app/shared-components/simple-code-editor/SimpleCodeEditor"

const actionTypes = [
  { id: "email", label: "Send Email", icon: <EmailIcon /> },
  { id: "sms", label: "Send SMS", icon: <SmsIcon /> },
  { id: "webhook", label: "Webhook", icon: <WebhookIcon /> },
  { id: "js_script", label: "JavaScript Script", icon: <CodeIcon /> },
  { id: "groovy_script", label: "Groovy Script", icon: <CodeIcon /> },
  { id: "api_call", label: "API Call", icon: <ApiIcon /> },
  { id: "data_transform", label: "Data Transform", icon: <DataObjectIcon /> },
]

function WorkflowEditor({ workflow = { trigger: { type: "form_submission", config: {} }, actions: [] }, onChange }) {
  const [selectedActionId, setSelectedActionId] = useState(null)
  const [codeDialogOpen, setCodeDialogOpen] = useState(false)
  const [scriptType, setScriptType] = useState("js")
  const [scriptCode, setScriptCode] = useState(
    '// Write your code here\n\nfunction processData(data) {\n  console.log("Processing data:", data);\n  return data;\n}\n',
  )

  const handleAddAction = (actionType) => {
    const newAction = {
      id: `action_${Date.now()}`,
      type: actionType,
      config: {},
    }

    if (actionType === "js_script") {
      newAction.config.code =
        "// Write your JavaScript code here\n\nfunction processData(data) {\n  console.log('Processing data:', data);\n  return data;\n}\n"
    } else if (actionType === "groovy_script") {
      newAction.config.code =
        '// Write your Groovy code here\n\ndef processData(data) {\n  println "Processing data: ${data}"\n  return data\n}\n'
    }

    const updatedWorkflow = {
      ...workflow,
      actions: [...(workflow?.actions || []), newAction],
    }

    onChange?.(updatedWorkflow)
    setSelectedActionId(newAction.id)

    if (actionType === "js_script" || actionType === "groovy_script") {
      setScriptType(actionType === "js_script" ? "js" : "groovy")
      setScriptCode(newAction.config.code)
      setCodeDialogOpen(true)
    }
  }

  const handleActionClick = (action) => {
    setSelectedActionId(action.id)

    if (action.type === "js_script" || action.type === "groovy_script") {
      setScriptType(action.type === "js_script" ? "js" : "groovy")
      setScriptCode(action.config?.code || "")
      setCodeDialogOpen(true)
    }
  }

  const handleSaveCode = () => {
    if (!selectedActionId || !workflow?.actions) {
      setCodeDialogOpen(false)
      return
    }

    const updatedActions = workflow.actions.map((action) =>
      action.id === selectedActionId
        ? {
            ...action,
            config: {
              ...action.config,
              code: scriptCode,
            },
          }
        : action,
    )

    onChange?.({
      ...workflow,
      actions: updatedActions,
    })
    setCodeDialogOpen(false)
  }

  return (
    <Box>
      <Box className="mb-4">
        <Typography variant="h6" className="mb-2">
          Add Actions
        </Typography>
        <div className="grid grid-cols-3 gap-3">
          {actionTypes.map((action) => (
            <Button
              key={action.id}
              variant="outlined"
              startIcon={action.icon}
              onClick={() => handleAddAction(action.id)}
              className="text-left justify-start"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </Box>

      <Box className="border rounded-lg p-4" sx={{ minHeight: 280 }}>
        <Typography variant="subtitle2" className="mb-2">
          Form Submission
        </Typography>
        <List dense>
          {(workflow?.actions || []).map((action, index) => {
            const actionMeta = actionTypes.find((item) => item.id === action.type)
            return (
              <ListItem key={action.id} disablePadding>
                <ListItemButton selected={selectedActionId === action.id} onClick={() => handleActionClick(action)}>
                  <ListItemIcon>{actionMeta?.icon || <CodeIcon />}</ListItemIcon>
                  <ListItemText
                    primary={`${index + 1}. ${actionMeta?.label || action.type}`}
                    secondary={action.type.includes("script") ? "Click to edit script" : "Configured action"}
                  />
                  <Chip size="small" label={action.type} />
                </ListItemButton>
              </ListItem>
            )
          })}
          {!workflow?.actions?.length && (
            <Typography variant="body2" color="text.secondary" className="py-8 text-center">
              No actions added yet
            </Typography>
          )}
        </List>
      </Box>

      <Dialog open={codeDialogOpen} onClose={() => setCodeDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {scriptType === "js" ? "JavaScript" : "Groovy"} Editor
          <IconButton
            aria-label="close"
            onClick={() => setCodeDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <SimpleCodeEditor value={scriptCode} onChange={setScriptCode} height={400} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCodeDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveCode}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default WorkflowEditor
