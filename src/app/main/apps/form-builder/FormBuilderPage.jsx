"use client"

import { useState, useRef } from "react"
import { useForm, FormProvider, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import SimpleCodeEditor from "@/app/shared-components/simple-code-editor/SimpleCodeEditor"
import {
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Checkbox,
  IconButton,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material"
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Visibility as VisibilityIcon,
  Code as CodeIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  Webhook as WebhookIcon,
  Api as ApiIcon,
  DataObject as DataObjectIcon,
  Workflow as WorkflowIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Subject as SubjectIcon,
  Message as MessageIcon,
} from "@mui/icons-material"

// Add this import at the top of the file
import FormPreview from "./FormPreview"

// Component types
const componentTypes = [
  { id: "text", label: "Text", icon: "text_fields" },
  { id: "number", label: "Number", icon: "pin" },
  { id: "select", label: "Select", icon: "arrow_drop_down_circle" },
  { id: "multiselect", label: "Select Multiple", icon: "checklist" },
  { id: "checkbox", label: "Checkbox", icon: "check_box" },
  { id: "radio", label: "Radio", icon: "radio_button_checked" },
  { id: "textarea", label: "Textarea", icon: "notes" },
  { id: "date", label: "Date", icon: "calendar_today" },
  { id: "time", label: "Time", icon: "access_time" },
  { id: "email", label: "Email", icon: "email" },
  { id: "url", label: "URL", icon: "link" },
  { id: "tel", label: "Tel", icon: "phone" },
]

// Client types
const clientTypes = [
  { id: "user", label: "User Panel Client" },
  { id: "admin", label: "Admin Panel Client" },
  { id: "website", label: "Main Website Client" },
  { id: "all", label: "All Clients" },
]

// UI Placement options
const uiPlacementOptions = [
  { id: "company-tabs", label: "Company Tabs" },
  { id: "company-details", label: "Company Details Page" },
  { id: "user-profile", label: "User Profile Page" },
  { id: "dashboard", label: "Dashboard" },
  { id: "new-page", label: "New Mini-App Page" },
]

// Comparison operators
const comparisonOperators = [
  { id: "equals", label: "equals" },
  { id: "not_equals", label: "not equals" },
  { id: "contains", label: "contains" },
  { id: "not_contains", label: "not contains" },
  { id: "greater_than", label: "greater than" },
  { id: "less_than", label: "less than" },
  { id: "starts_with", label: "starts with" },
  { id: "ends_with", label: "ends with" },
]

// Workflow action types
const actionTypes = [
  { id: "email", label: "Send Email", icon: <EmailIcon />, color: "#4285F4" },
  { id: "sms", label: "Send SMS", icon: <SmsIcon />, color: "#34A853" },
  { id: "webhook", label: "Webhook", icon: <WebhookIcon />, color: "#EA4335" },
  { id: "js_script", label: "JavaScript Script", icon: <CodeIcon />, color: "#FBBC05" },
  { id: "groovy_script", label: "Groovy Script", icon: <CodeIcon />, color: "#7B1FA2" },
  { id: "api_call", label: "API Call", icon: <ApiIcon />, color: "#1976D2" },
  { id: "data_transform", label: "Data Transform", icon: <DataObjectIcon />, color: "#FF6D00" },
]

// Initial form state
const initialForm = {
  title: "New Form",
  description: "",
  components: [],
  clientType: "all",
  uiPlacement: "company-details",
  placementPosition: "top",
  successMessage: "Form submitted successfully!",
  errorMessage: "There was an error submitting the form. Please try again.",
  redirectUrl: "",
}

// Initial workflow state
const initialWorkflow = {
  trigger: {
    type: "form_submission",
    config: {},
  },
  actions: [],
}

// Standalone FormBuilderPage component without Redux dependencies
function FormBuilderPage() {
  const [form, setForm] = useState(initialForm)
  const [selectedComponent, setSelectedComponent] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [configSection, setConfigSection] = useState("properties")
  const [searchTerm, setSearchTerm] = useState("")
  const [previewOpen, setPreviewOpen] = useState(false)
  const [codeDialogOpen, setCodeDialogOpen] = useState(false)
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false)
  const [scriptType, setScriptType] = useState("js")
  const [scriptCode, setScriptCode] = useState(
    "// Write your code here\n\nfunction processFormData(data) {\n  console.log('Processing form data:', data);\n  return data;\n}\n",
  )
  const [workflow, setWorkflow] = useState(initialWorkflow)
  const [selectedAction, setSelectedAction] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")
  const [actionConfigOpen, setActionConfigOpen] = useState(false)
  const [currentActionType, setCurrentActionType] = useState(null)
  const [currentActionConfig, setCurrentActionConfig] = useState({})
  const [currentActionId, setCurrentActionId] = useState(null)

  // Email action form
  const emailFormMethods = useForm({
    defaultValues: {
      subject: "",
      recipients: "",
      message: "",
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: new Date().toTimeString().slice(0, 5),
    },
  })

  // SMS action form
  const smsFormMethods = useForm({
    defaultValues: {
      recipients: "",
      message: "",
      scheduledDate: new Date().toISOString().split("T")[0],
      scheduledTime: new Date().toTimeString().slice(0, 5),
    },
  })

  // Webhook action form
  const webhookFormMethods = useForm({
    defaultValues: {
      url: "",
      method: "POST",
      headers: "",
      body: "",
    },
  })

  // API call action form
  const apiCallFormMethods = useForm({
    defaultValues: {
      url: "",
      method: "GET",
      headers: "",
      body: "",
      authentication: "none",
      authToken: "",
      username: "",
      password: "",
    },
  })

  // Generate Zod schema based on form components
  const generateZodSchema = () => {
    const schemaObj = {}

    form.components.forEach((component) => {
      let fieldSchema = z.string()

      if (component.required) {
        fieldSchema = fieldSchema.min(1, { message: `${component.label} is required` })
      } else {
        fieldSchema = fieldSchema.optional()
      }

      switch (component.type) {
        case "email":
          fieldSchema = component.required
            ? z
                .string()
                .email({ message: "Invalid email address" })
                .min(1, { message: `${component.label} is required` })
            : z.string().email({ message: "Invalid email address" }).optional()
          break
        case "number":
          fieldSchema = component.required
            ? z
                .string()
                .refine((val) => !isNaN(val), { message: "Must be a number" })
                .min(1, { message: `${component.label} is required` })
            : z
                .string()
                .refine((val) => !isNaN(val) || val === "", { message: "Must be a number" })
                .optional()
          break
        case "url":
          fieldSchema = component.required
            ? z
                .string()
                .url({ message: "Invalid URL" })
                .min(1, { message: `${component.label} is required` })
            : z.string().url({ message: "Invalid URL" }).optional()
          break
        case "checkbox":
          fieldSchema = z.boolean().optional()
          break
        case "select":
          fieldSchema = component.required
            ? z.string().min(1, { message: `${component.label} is required` })
            : z.string().optional()
          break
        case "multiselect":
          fieldSchema = component.required
            ? z.array(z.string()).min(1, { message: `${component.label} is required` })
            : z.array(z.string()).optional()
          break
      }

      // Add custom validation based on validation rules
      if (component.validation && component.validation.length > 0) {
        // This would be more complex in a real implementation
        // Just a placeholder for now
        fieldSchema = fieldSchema.refine((val) => true, {
          message: "Custom validation failed",
        })
      }

      schemaObj[component.name] = fieldSchema
    })

    return z.object(schemaObj)
  }

  // Create form methods with React Hook Form
  const formSchema = generateZodSchema()
  const formMethods = useForm({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  })

  // Create a new component based on type
  const createNewComponent = (type) => {
    const id = `${type}_${Date.now()}`
    const component = {
      id,
      type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      name: type.toLowerCase() + Date.now(),
      placeholder: "",
      tooltip: "",
      defaultValue: "",
      required: false,
      validation: [],
      options:
        type === "select" || type === "multiselect" || type === "radio"
          ? [
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
            ]
          : [],
      visibility: {
        conditions: [],
      },
    }

    return component
  }

  // Add a new component
  const handleAddComponent = (type) => {
    const newComponent = createNewComponent(type)
    setForm({
      ...form,
      components: [...form.components, newComponent],
    })
    setSelectedComponent(newComponent.id)
  }

  // Delete a component
  const handleDeleteComponent = (id) => {
    const updatedComponents = form.components.filter((c) => c.id !== id)
    setForm({
      ...form,
      components: updatedComponents,
    })

    if (selectedComponent === id) {
      setSelectedComponent(updatedComponents.length > 0 ? updatedComponents[0].id : null)
    }
  }

  // Update component properties
  const handleUpdateComponent = (id, updates) => {
    const updatedComponents = form.components.map((component) =>
      component.id === id ? { ...component, ...updates } : component,
    )

    setForm({
      ...form,
      components: updatedComponents,
    })
  }

  // Add validation rule
  const handleAddValidation = (componentId) => {
    const component = form.components.find((c) => c.id === componentId)
    if (!component) return

    const newValidation = {
      id: `validation_${Date.now()}`,
      field: component.name,
      operator: "equals",
      value: "",
      caseSensitive: false,
    }

    handleUpdateComponent(componentId, {
      validation: [...component.validation, newValidation],
    })
  }

  // Delete validation rule
  const handleDeleteValidation = (componentId, validationId) => {
    const component = form.components.find((c) => c.id === componentId)
    if (!component) return

    const updatedValidation = component.validation.filter((v) => v.id !== validationId)

    handleUpdateComponent(componentId, {
      validation: updatedValidation,
    })
  }

  // Update validation rule
  const handleUpdateValidation = (componentId, validationId, updates) => {
    const component = form.components.find((c) => c.id === componentId)
    if (!component) return

    const updatedValidation = component.validation.map((validation) =>
      validation.id === validationId ? { ...validation, ...updates } : validation,
    )

    handleUpdateComponent(componentId, {
      validation: updatedValidation,
    })
  }

  // Add logical operator between validation rules
  const handleAddLogicalOperator = (componentId, validationId, operator) => {
    const component = form.components.find((c) => c.id === componentId)
    if (!component) return

    const validationIndex = component.validation.findIndex((v) => v.id === validationId)
    if (validationIndex === -1) return

    const newValidation = {
      id: `validation_${Date.now()}`,
      field: component.name,
      operator: "equals",
      value: "",
      caseSensitive: false,
      logicalOperator: operator,
    }

    const updatedValidation = [...component.validation]
    updatedValidation.splice(validationIndex + 1, 0, newValidation)

    handleUpdateComponent(componentId, {
      validation: updatedValidation,
    })
  }

  // Get the selected component
  const getSelectedComponent = () => {
    return form.components.find((c) => c.id === selectedComponent)
  }

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // Move component up in the list
  const moveComponentUp = (index) => {
    if (index === 0) return

    const updatedComponents = [...form.components]
    const temp = updatedComponents[index]
    updatedComponents[index] = updatedComponents[index - 1]
    updatedComponents[index - 1] = temp

    setForm({
      ...form,
      components: updatedComponents,
    })
  }

  // Move component down in the list
  const moveComponentDown = (index) => {
    if (index === form.components.length - 1) return

    const updatedComponents = [...form.components]
    const temp = updatedComponents[index]
    updatedComponents[index] = updatedComponents[index + 1]
    updatedComponents[index + 1] = temp

    setForm({
      ...form,
      components: updatedComponents,
    })
  }

  // Handle save button click
  const handleSave = () => {
    // Generate Zod schema
    const schema = generateZodSchema()
    console.log("Generated Zod Schema:", schema)

    // Log form configuration
    console.log("Form Configuration:", form)

    // Log workflow configuration
    console.log("Workflow Configuration:", workflow)

    // Show success message
    setSnackbarMessage("Form saved successfully!")
    setSnackbarSeverity("success")
    setSnackbarOpen(true)
  }

  // Handle preview button click
  const handlePreview = () => {
    setPreviewOpen(true)
  }

  // Handle code button click
  const handleCodeClick = () => {
    setCodeDialogOpen(true)
  }

  // Handle workflow button click
  const handleWorkflowClick = () => {
    setWorkflowDialogOpen(true)
  }

  // Handle adding a new action to the workflow
  const handleAddAction = (actionType) => {
    const newAction = {
      id: `action_${Date.now()}`,
      type: actionType,
      config: {},
    }

    // For script types, add default code
    if (actionType === "js_script") {
      newAction.config.code =
        "// Write your JavaScript code here\n\nfunction processData(data) {\n  console.log('Processing data:', data);\n  return data;\n}\n"
    } else if (actionType === "groovy_script") {
      newAction.config.code =
        '// Write your Groovy code here\n\ndef processData(data) {\n  println "Processing data: ${data}"\n  return data\n}\n'
    } else if (actionType === "email") {
      newAction.config = {
        subject: "",
        recipients: "",
        message: "",
        scheduledDate: new Date().toISOString().split("T")[0],
        scheduledTime: new Date().toTimeString().slice(0, 5),
      }
    } else if (actionType === "sms") {
      newAction.config = {
        recipients: "",
        message: "",
        scheduledDate: new Date().toISOString().split("T")[0],
        scheduledTime: new Date().toTimeString().slice(0, 5),
      }
    } else if (actionType === "webhook") {
      newAction.config = {
        url: "",
        method: "POST",
        headers: "",
        body: "",
      }
    } else if (actionType === "api_call") {
      newAction.config = {
        url: "",
        method: "GET",
        headers: "",
        body: "",
        authentication: "none",
        authToken: "",
        username: "",
        password: "",
      }
    }

    // Add the action to the workflow
    const updatedWorkflow = {
      ...workflow,
      actions: [...workflow.actions, newAction],
    }

    setWorkflow(updatedWorkflow)
    setSelectedAction(newAction.id)
  }

  // Handle running JavaScript code
  const handleRunJsCode = () => {
    try {
      // Create a safe evaluation environment
      const formData = {
        title: form.title,
        components: form.components.map((c) => ({
          name: c.name,
          type: c.type,
          value: c.defaultValue,
        })),
      }

      // Execute the code
      eval(`
        const formData = ${JSON.stringify(formData)};
        ${scriptCode}
        // Call the main function if it exists
        if (typeof processFormData === 'function') {
          const result = processFormData(formData);
          console.log('Script execution result:', result);
        }
      `)

      setSnackbarMessage("JavaScript code executed successfully!")
      setSnackbarSeverity("success")
      setSnackbarOpen(true)
    } catch (error) {
      console.error("Error executing JavaScript:", error)
      setSnackbarMessage(`Error executing JavaScript: ${error.message}`)
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    }
  }

  // Handle running Groovy code (just log it for now)
  const handleRunGroovyCode = () => {
    console.log("Groovy code to execute:", scriptCode)
    setSnackbarMessage("Groovy code logged to console (would be executed on server)")
    setSnackbarSeverity("info")
    setSnackbarOpen(true)
  }

  const handleActionClick = (action) => {
    const actionIndex = workflow.actions.findIndex((item) => item.id === action.id)

    if (actionIndex === -1) {
      return
    }

    setCurrentActionId(action.id)
    setCurrentActionType(action.type)
    setCurrentActionConfig(action.config || {})

    if (action.type === "email") {
        emailFormMethods.reset(
          action.config || {
            subject: "",
            recipients: "",
            message: "",
            scheduledDate: new Date().toISOString().split("T")[0],
            scheduledTime: new Date().toTimeString().slice(0, 5),
          },
        )
      } else if (action.type === "sms") {
        smsFormMethods.reset(
          action.config || {
            recipients: "",
            message: "",
            scheduledDate: new Date().toISOString().split("T")[0],
            scheduledTime: new Date().toTimeString().slice(0, 5),
          },
        )
      } else if (action.type === "webhook") {
        webhookFormMethods.reset(
          action.config || {
            url: "",
            method: "POST",
            headers: "",
            body: "",
          },
        )
      } else if (action.type === "api_call") {
        apiCallFormMethods.reset(
          action.config || {
            url: "",
            method: "GET",
            headers: "",
            body: "",
            authentication: "none",
            authToken: "",
            username: "",
            password: "",
          },
        )
      } else if (action.type === "js_script" || action.type === "groovy_script") {
        setScriptType(action.type === "js_script" ? "js" : "groovy")
        setScriptCode(action.config?.code || "// Write your code here")
        setCodeDialogOpen(true)
        return
      }

    setActionConfigOpen(true)
  }

  // Handle saving action configuration
  const handleSaveActionConfig = (data) => {
    if (!currentActionId || !currentActionType) return

    const actionIndex = workflow.actions.findIndex((action) => action.id === currentActionId)
    if (actionIndex === -1) return

    const updatedActions = [...workflow.actions]
    updatedActions[actionIndex] = {
      ...updatedActions[actionIndex],
      config: data,
    }

    setWorkflow({
      ...workflow,
      actions: updatedActions,
    })

    setActionConfigOpen(false)

    setSnackbarMessage("Action configuration saved!")
    setSnackbarSeverity("success")
    setSnackbarOpen(true)
  }

  // Render component in the form preview
  const renderComponent = (component, index) => {
    const isSelected = component.id === selectedComponent

    return (
      <Paper
        key={component.id}
        elevation={isSelected ? 3 : 1}
        className={`relative mb-4 p-4 border rounded-lg ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
        onClick={() => setSelectedComponent(component.id)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="cursor-move">
            <DragIndicatorIcon className="text-gray-500" />
          </div>
          <div className="flex-1 mx-2">
            <div className="flex items-center">
              <span className="bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center mr-2">
                {index + 1}
              </span>
              <Typography variant="subtitle1" className="font-medium">
                {component.label}
              </Typography>
              {component.required && <Chip size="small" color="primary" label="Required" className="ml-2" />}
            </div>
            <Typography variant="caption" className="text-gray-500">
              {`<${component.type} name="${component.name}" />`}
            </Typography>
          </div>
          <div className="flex">
            <IconButton size="small" onClick={() => moveComponentUp(index)} disabled={index === 0}>
              <span className="material-icons text-gray-600">arrow_upward</span>
            </IconButton>
            <IconButton
              size="small"
              onClick={() => moveComponentDown(index)}
              disabled={index === form.components.length - 1}
            >
              <span className="material-icons text-gray-600">arrow_downward</span>
            </IconButton>
            <IconButton size="small" onClick={() => handleDeleteComponent(component.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </div>
        </div>

        <div className="mt-2">{renderComponentPreview(component)}</div>
      </Paper>
    )
  }

  // Render component preview
  const renderComponentPreview = (component) => {
    switch (component.type) {
      case "text":
        return (
          <TextField
            fullWidth
            label={component.label}
            placeholder={component.placeholder}
            variant="outlined"
            size="small"
            disabled
          />
        )
      case "number":
        return (
          <TextField
            fullWidth
            label={component.label}
            placeholder={component.placeholder}
            type="number"
            variant="outlined"
            size="small"
            disabled
          />
        )
      case "select":
        return (
          <FormControl fullWidth size="small" variant="outlined">
            <InputLabel>{component.label}</InputLabel>
            <Select label={component.label} disabled>
              {component.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      case "textarea":
        return (
          <TextField
            fullWidth
            label={component.label}
            placeholder={component.placeholder}
            multiline
            rows={3}
            variant="outlined"
            size="small"
            disabled
          />
        )
      case "checkbox":
        return <FormControlLabel control={<Checkbox disabled />} label={component.label} />
      default:
        return (
          <TextField
            fullWidth
            label={component.label}
            placeholder={component.placeholder}
            variant="outlined"
            size="small"
            disabled
          />
        )
    }
  }

  // Render component palette
  const renderComponentPalette = () => {
    const filteredComponents = componentTypes.filter((type) =>
      type.label.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
      <div className="grid grid-cols-2 gap-2">
        {filteredComponents.map((type) => (
          <Paper
            key={type.id}
            className="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50"
            onClick={() => handleAddComponent(type.id)}
          >
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                <span className="material-icons text-gray-600">{type.icon}</span>
              </div>
              <Typography variant="body2" className="text-center">
                {type.label}
              </Typography>
            </div>
          </Paper>
        ))}
      </div>
    )
  }

  // Render component configuration
  const renderComponentConfig = () => {
    const component = getSelectedComponent()
    if (!component) return null

    return (
      <div className="space-y-4">
        <div className="flex space-x-4 mb-4">
          <Button
            variant={configSection === "properties" ? "contained" : "outlined"}
            size="small"
            onClick={() => setConfigSection("properties")}
          >
            Properties
          </Button>
          <Button
            variant={configSection === "validation" ? "contained" : "outlined"}
            size="small"
            onClick={() => setConfigSection("validation")}
          >
            Validation
          </Button>
          <Button
            variant={configSection === "display" ? "contained" : "outlined"}
            size="small"
            onClick={() => setConfigSection("display")}
          >
            Display
          </Button>
        </div>

        {configSection === "properties" && (
          <div className="space-y-4">
            <TextField
              fullWidth
              label="Label"
              value={component.label}
              onChange={(e) => handleUpdateComponent(component.id, { label: e.target.value })}
              variant="outlined"
              size="small"
            />

            <TextField
              fullWidth
              label="Name"
              value={component.name}
              onChange={(e) => handleUpdateComponent(component.id, { name: e.target.value })}
              variant="outlined"
              size="small"
              helperText="This will be used as the field name in form submissions"
            />

            <TextField
              fullWidth
              label="Placeholder"
              value={component.placeholder}
              onChange={(e) => handleUpdateComponent(component.id, { placeholder: e.target.value })}
              variant="outlined"
              size="small"
            />

            <TextField
              fullWidth
              label="Tooltip"
              value={component.tooltip}
              onChange={(e) => handleUpdateComponent(component.id, { tooltip: e.target.value })}
              variant="outlined"
              size="small"
              multiline
              rows={2}
            />

            <TextField
              fullWidth
              label="Default Value"
              value={component.defaultValue}
              onChange={(e) => handleUpdateComponent(component.id, { defaultValue: e.target.value })}
              variant="outlined"
              size="small"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={component.required}
                  onChange={(e) => handleUpdateComponent(component.id, { required: e.target.checked })}
                />
              }
              label="Required"
            />

            {(component.type === "select" || component.type === "multiselect" || component.type === "radio") && (
              <div className="space-y-2">
                <Typography variant="subtitle2">Options</Typography>
                {component.options.map((option, index) => (
                  <div key={index} className="flex space-x-2">
                    <TextField
                      label="Label"
                      value={option.label}
                      onChange={(e) => {
                        const updatedOptions = [...component.options]
                        updatedOptions[index].label = e.target.value
                        handleUpdateComponent(component.id, { options: updatedOptions })
                      }}
                      variant="outlined"
                      size="small"
                      className="flex-1"
                    />
                    <TextField
                      label="Value"
                      value={option.value}
                      onChange={(e) => {
                        const updatedOptions = [...component.options]
                        updatedOptions[index].value = e.target.value
                        handleUpdateComponent(component.id, { options: updatedOptions })
                      }}
                      variant="outlined"
                      size="small"
                      className="flex-1"
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        const updatedOptions = component.options.filter((_, i) => i !== index)
                        handleUpdateComponent(component.id, { options: updatedOptions })
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => {
                    const updatedOptions = [
                      ...component.options,
                      {
                        label: `Option ${component.options.length + 1}`,
                        value: `option${component.options.length + 1}`,
                      },
                    ]
                    handleUpdateComponent(component.id, { options: updatedOptions })
                  }}
                  size="small"
                >
                  Add Option
                </Button>
              </div>
            )}
          </div>
        )}

        {configSection === "validation" && (
          <div className="space-y-4">
            {component.validation.map((validation, index) => (
              <Paper key={validation.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <Typography variant="subtitle2">
                    {index > 0 && (
                      <span className="px-2 py-1 bg-gray-100 rounded mr-2">{validation.logicalOperator || "AND"}</span>
                    )}
                    Rule {index + 1}
                  </Typography>
                  <IconButton size="small" onClick={() => handleDeleteValidation(component.id, validation.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>

                <div className="space-y-3">
                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel>Field Name</InputLabel>
                    <Select
                      label="Field Name"
                      value={validation.field}
                      onChange={(e) => handleUpdateValidation(component.id, validation.id, { field: e.target.value })}
                    >
                      <MenuItem value={component.name}>{component.name}</MenuItem>
                      <MenuItem value="company.id">{"{{company.id}}"}</MenuItem>
                      <MenuItem value="user.id">{"{{user.id}}"}</MenuItem>
                      <MenuItem value="form.id">{"{{form.id}}"}</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small" variant="outlined">
                    <InputLabel>Comparison</InputLabel>
                    <Select
                      label="Comparison"
                      value={validation.operator}
                      onChange={(e) =>
                        handleUpdateValidation(component.id, validation.id, { operator: e.target.value })
                      }
                    >
                      {comparisonOperators.map((op) => (
                        <MenuItem key={op.id} value={op.id}>
                          {op.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Value"
                    value={validation.value}
                    onChange={(e) => handleUpdateValidation(component.id, validation.id, { value: e.target.value })}
                    variant="outlined"
                    size="small"
                  />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={validation.caseSensitive}
                        onChange={(e) =>
                          handleUpdateValidation(component.id, validation.id, { caseSensitive: e.target.checked })
                        }
                      />
                    }
                    label="Case sensitivity?"
                  />
                </div>

                {index < component.validation.length - 1 ? null : (
                  <div className="mt-3 flex space-x-2">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleAddLogicalOperator(component.id, validation.id, "AND")}
                    >
                      AND
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleAddLogicalOperator(component.id, validation.id, "OR")}
                    >
                      OR
                    </Button>
                  </div>
                )}
              </Paper>
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={() => handleAddValidation(component.id)}
              variant="outlined"
              fullWidth
            >
              Add Rule
            </Button>
          </div>
        )}

        {configSection === "display" && (
          <div className="space-y-4">
            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>Client Type</InputLabel>
              <Select
                label="Client Type"
                value={component.clientType || "all"}
                onChange={(e) => handleUpdateComponent(component.id, { clientType: e.target.value })}
              >
                {clientTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" variant="outlined">
              <InputLabel>UI Placement</InputLabel>
              <Select
                label="UI Placement"
                value={component.uiPlacement || "company-details"}
                onChange={(e) => handleUpdateComponent(component.id, { uiPlacement: e.target.value })}
              >
                {uiPlacementOptions.map((option) => (
                  <MenuItem key={option.id} value={option.id}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Position"
              placeholder="e.g., top, after-header, before-footer"
              value={component.placementPosition || ""}
              onChange={(e) => handleUpdateComponent(component.id, { placementPosition: e.target.value })}
              variant="outlined"
              size="small"
              helperText="Specify the position relative to other elements"
            />

            <Button
              startIcon={<VisibilityIcon />}
              onClick={() => {
                // Open visibility conditions editor
              }}
              variant="outlined"
              fullWidth
            >
              Edit Visibility Conditions
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Render form settings
  const renderFormSettings = () => {
    return (
      <div className="space-y-4">
        <Card className="mb-4">
          <CardContent>
            <Typography variant="h6" className="mb-4">
              General Settings
            </Typography>
            <div className="space-y-4">
              <TextField
                fullWidth
                label="Form Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                variant="outlined"
                multiline
                rows={3}
              />

              <FormControl fullWidth variant="outlined">
                <InputLabel>Client Type</InputLabel>
                <Select
                  label="Client Type"
                  value={form.clientType}
                  onChange={(e) => setForm({ ...form, clientType: e.target.value })}
                >
                  {clientTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth variant="outlined">
                <InputLabel>UI Placement</InputLabel>
                <Select
                  label="UI Placement"
                  value={form.uiPlacement}
                  onChange={(e) => setForm({ ...form, uiPlacement: e.target.value })}
                >
                  {uiPlacementOptions.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Placement Position"
                placeholder="e.g., top, after-header, before-footer"
                value={form.placementPosition}
                onChange={(e) => setForm({ ...form, placementPosition: e.target.value })}
                variant="outlined"
                helperText="Specify the position relative to other elements"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent>
            <Typography variant="h6" className="mb-4">
              Submission Settings
            </Typography>
            <div className="space-y-4">
              <TextField
                fullWidth
                label="Redirect URL"
                placeholder="https://example.com/thank-you"
                value={form.redirectUrl}
                onChange={(e) => setForm({ ...form, redirectUrl: e.target.value })}
                variant="outlined"
                helperText="Leave empty to stay on the same page"
              />

              <TextField
                fullWidth
                label="Success Message"
                value={form.successMessage}
                onChange={(e) => setForm({ ...form, successMessage: e.target.value })}
                variant="outlined"
                multiline
                rows={2}
              />

              <TextField
                fullWidth
                label="Error Message"
                value={form.errorMessage}
                onChange={(e) => setForm({ ...form, errorMessage: e.target.value })}
                variant="outlined"
                multiline
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" className="mb-4">
              Workflow Settings
            </Typography>
            <div className="space-y-4">
              <Button variant="outlined" startIcon={<WorkflowIcon />} onClick={handleWorkflowClick} fullWidth>
                Configure Workflow
              </Button>

              {workflow.actions.length > 0 && (
                <div>
                  <Typography variant="subtitle2" className="mb-2">
                    Configured Actions:
                  </Typography>
                  <List dense>
                    {workflow.actions.map((action, index) => (
                      <ListItem key={action.id}>
                        <ListItemIcon>
                          {actionTypes.find((a) => a.id === action.type)?.icon || <CodeIcon />}
                        </ListItemIcon>
                        <ListItemText
                          primary={actionTypes.find((a) => a.id === action.type)?.label || action.type}
                          secondary={`Step ${index + 1}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render workflow editor
  const renderWorkflowEditor = () => {
    return (
      <div className="h-full flex flex-col">
        <div className="mb-4">
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
                style={{ borderColor: action.color, color: action.color }}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>

        <Box className="border rounded-lg p-4" sx={{ minHeight: 500 }}>
          <Typography variant="subtitle2" className="mb-2">
            Form Submission
          </Typography>
          <List dense>
            {workflow.actions.map((action, index) => {
              const actionTypeDetails = actionTypes.find((item) => item.id === action.type)
              return (
                <ListItem key={action.id} disablePadding>
                  <ListItemButton onClick={() => handleActionClick(action)}>
                    <ListItemIcon>{actionTypeDetails?.icon || <CodeIcon />}</ListItemIcon>
                    <ListItemText
                      primary={`${index + 1}. ${actionTypeDetails?.label || action.type}`}
                      secondary="Click to configure"
                    />
                    <Chip size="small" label={action.type} />
                  </ListItemButton>
                </ListItem>
              )
            })}
            {workflow.actions.length === 0 && (
              <Typography variant="body2" color="text.secondary" className="py-8 text-center">
                No actions added yet
              </Typography>
            )}
          </List>
        </Box>
      </div>
    )
  }

  // Render email action configuration form
  const renderEmailActionForm = () => {
    const {
      control,
      handleSubmit,
      formState: { errors },
    } = emailFormMethods

    return (
      <form onSubmit={handleSubmit(handleSaveActionConfig)}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="subject"
                control={control}
                defaultValue=""
                rules={{ required: "Subject is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Subject"
                    fullWidth
                    variant="outlined"
                    error={!!errors.subject}
                    helperText={errors.subject?.message}
                    InputProps={{
                      startAdornment: <SubjectIcon className="mr-2 text-gray-400" />,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="recipients"
                control={control}
                defaultValue=""
                rules={{ required: "Recipients are required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Recipients"
                    fullWidth
                    variant="outlined"
                    error={!!errors.recipients}
                    helperText={errors.recipients?.message || "Separate multiple emails with commas"}
                    InputProps={{
                      startAdornment: <PersonIcon className="mr-2 text-gray-400" />,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="message"
                control={control}
                defaultValue=""
                rules={{ required: "Message is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Message"
                    fullWidth
                    multiline
                    rows={6}
                    variant="outlined"
                    error={!!errors.message}
                    helperText={errors.message?.message}
                    InputProps={{
                      startAdornment: <MessageIcon className="mr-2 text-gray-400" />,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="scheduledDate"
                control={control}
                defaultValue={new Date().toISOString().split("T")[0]}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Schedule Date"
                    type="date"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.scheduledDate}
                    helperText={errors?.scheduledDate?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="scheduledTime"
                control={control}
                defaultValue={new Date().toTimeString().slice(0, 5)}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Schedule Time"
                    type="time"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.scheduledTime}
                    helperText={errors?.scheduledTime?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionConfigOpen(false)}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    )
  }

  // Render SMS action configuration form
  const renderSmsActionForm = () => {
    const {
      control,
      handleSubmit,
      formState: { errors },
    } = smsFormMethods

    return (
      <form onSubmit={handleSubmit(handleSaveActionConfig)}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="recipients"
                control={control}
                defaultValue=""
                rules={{ required: "Recipients are required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Recipients"
                    fullWidth
                    variant="outlined"
                    error={!!errors.recipients}
                    helperText={errors.recipients?.message || "Separate multiple phone numbers with commas"}
                    InputProps={{
                      startAdornment: <PersonIcon className="mr-2 text-gray-400" />,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="message"
                control={control}
                defaultValue=""
                rules={{ required: "Message is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Message"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    error={!!errors.message}
                    helperText={errors.message?.message}
                    InputProps={{
                      startAdornment: <MessageIcon className="mr-2 text-gray-400" />,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="scheduledDate"
                control={control}
                defaultValue={new Date().toISOString().split("T")[0]}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Schedule Date"
                    type="date"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.scheduledDate}
                    helperText={errors?.scheduledDate?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="scheduledTime"
                control={control}
                defaultValue={new Date().toTimeString().slice(0, 5)}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Schedule Time"
                    type="time"
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.scheduledTime}
                    helperText={errors?.scheduledTime?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionConfigOpen(false)}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    )
  }

  // Render webhook action configuration form
  const renderWebhookActionForm = () => {
    const {
      control,
      handleSubmit,
      formState: { errors },
      watch,
    } = webhookFormMethods
    const method = watch("method")

    return (
      <form onSubmit={handleSubmit(handleSaveActionConfig)}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="url"
                control={control}
                defaultValue=""
                rules={{ required: "URL is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Webhook URL"
                    fullWidth
                    variant="outlined"
                    error={!!errors.url}
                    helperText={errors.url?.message}
                    InputProps={{
                      startAdornment: <WebhookIcon className="mr-2 text-gray-400" />,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="method"
                control={control}
                defaultValue="POST"
                render={({ field }) => (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>HTTP Method</InputLabel>
                    <Select {...field} label="HTTP Method">
                      <MenuItem value="GET">GET</MenuItem>
                      <MenuItem value="POST">POST</MenuItem>
                      <MenuItem value="PUT">PUT</MenuItem>
                      <MenuItem value="DELETE">DELETE</MenuItem>
                      <MenuItem value="PATCH">PATCH</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="headers"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Headers (JSON)"
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    error={!!errors.headers}
                    helperText={errors.headers?.message || '{"Content-Type": "application/json"}'}
                  />
                )}
              />
            </Grid>
            {(method === "POST" || method === "PUT" || method === "PATCH") && (
              <Grid item xs={12}>
                <Controller
                  name="body"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Request Body (JSON)"
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      error={!!errors.body}
                      helperText={errors.body?.message}
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionConfigOpen(false)}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    )
  }

  // Render API call action configuration form
  const renderApiCallActionForm = () => {
    const {
      control,
      handleSubmit,
      formState: { errors },
      watch,
    } = apiCallFormMethods
    const method = watch("method")
    const authType = watch("authentication")

    return (
      <form onSubmit={handleSubmit(handleSaveActionConfig)}>
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="url"
                control={control}
                defaultValue=""
                rules={{ required: "URL is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="API URL"
                    fullWidth
                    variant="outlined"
                    error={!!errors.url}
                    helperText={errors.url?.message}
                    InputProps={{
                      startAdornment: <ApiIcon className="mr-2 text-gray-400" />,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="method"
                control={control}
                defaultValue="GET"
                render={({ field }) => (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>HTTP Method</InputLabel>
                    <Select {...field} label="HTTP Method">
                      <MenuItem value="GET">GET</MenuItem>
                      <MenuItem value="POST">POST</MenuItem>
                      <MenuItem value="PUT">PUT</MenuItem>
                      <MenuItem value="DELETE">DELETE</MenuItem>
                      <MenuItem value="PATCH">PATCH</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name="authentication"
                control={control}
                defaultValue="none"
                render={({ field }) => (
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Authentication</InputLabel>
                    <Select {...field} label="Authentication">
                      <MenuItem value="none">None</MenuItem>
                      <MenuItem value="basic">Basic Auth</MenuItem>
                      <MenuItem value="bearer">Bearer Token</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            {authType === "bearer" && (
              <Grid item xs={12}>
                <Controller
                  name="authToken"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Token is required for Bearer authentication" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Bearer Token"
                      fullWidth
                      variant="outlined"
                      error={!!errors.authToken}
                      helperText={errors.authToken?.message}
                    />
                  )}
                />
              </Grid>
            )}

            {authType === "basic" && (
              <>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="username"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Username is required for Basic authentication" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Username"
                        fullWidth
                        variant="outlined"
                        error={!!errors.username}
                        helperText={errors.username?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="password"
                    control={control}
                    defaultValue=""
                    rules={{ required: "Password is required for Basic authentication" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Password"
                        type="password"
                        fullWidth
                        variant="outlined"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                      />
                    )}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Controller
                name="headers"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Headers (JSON)"
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    error={!!errors.headers}
                    helperText={errors.headers?.message || '{"Content-Type": "application/json"}'}
                  />
                )}
              />
            </Grid>

            {(method === "POST" || method === "PUT" || method === "PATCH") && (
              <Grid item xs={12}>
                <Controller
                  name="body"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Request Body (JSON)"
                      fullWidth
                      multiline
                      rows={4}
                      variant="outlined"
                      error={!!errors.body}
                      helperText={errors.body?.message}
                    />
                  )}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionConfigOpen(false)}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    )
  }

  // Render the appropriate action configuration form based on the action type
  const renderActionConfigForm = () => {
    switch (currentActionType) {
      case "email":
        return renderEmailActionForm()
      case "sms":
        return renderSmsActionForm()
      case "webhook":
        return renderWebhookActionForm()
      case "api_call":
        return renderApiCallActionForm()
      default:
        return (
          <>
            <DialogContent>
              <Typography>Configuration not available for this action type.</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setActionConfigOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )
    }
  }

  return (
    <Box className="flex flex-col h-full">
      <AppBar position="static" color="default" elevation={0} className="border-b">
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="back">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" className="ml-2 flex-grow">
            Form Builder
          </Typography>
          <Button startIcon={<PreviewIcon />} className="mx-2" onClick={handlePreview}>
            Preview
          </Button>
          <Button startIcon={<CodeIcon />} className="mx-2" onClick={handleCodeClick}>
            Code
          </Button>
          <Button startIcon={<WorkflowIcon />} className="mx-2" onClick={handleWorkflowClick}>
            Workflow
          </Button>
          <Button startIcon={<SaveIcon />} variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </Toolbar>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Components" />
          <Tab label="Settings" />
          <Tab label="Workflow" />
          <Tab label="Preview" />
        </Tabs>
      </AppBar>

      <Box className="flex flex-1 overflow-hidden">
        {activeTab === 0 && (
          <>
            {/* Left panel - Component palette and configuration */}
            <Box className="w-1/4 border-r overflow-y-auto p-4">
              {selectedComponent ? (
                <Box>
                  <div className="flex justify-between items-center mb-4">
                    <Typography variant="h6">Component Settings</Typography>
                    <Button size="small" onClick={() => setSelectedComponent(null)}>
                      Back
                    </Button>
                  </div>
                  {renderComponentConfig()}
                </Box>
              ) : (
                <Box>
                  <Typography variant="h6" className="mb-4">
                    Components
                  </Typography>
                  <div className="mb-4">
                    <TextField
                      fullWidth
                      placeholder="Search components..."
                      variant="outlined"
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: <span className="material-icons text-gray-400 mr-2">search</span>,
                      }}
                    />
                  </div>
                  <div className="component-palette">{renderComponentPalette()}</div>
                </Box>
              )}
            </Box>

            {/* Middle panel - Form components */}
            <Box className="w-2/4 border-r overflow-y-auto p-4">
              <Typography variant="h6" className="mb-4">
                Form Structure
              </Typography>
              <div className="min-h-[200px] border-2 border-dashed border-gray-300 rounded-lg p-4">
                {form.components.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <span className="material-icons text-4xl mb-2">drag_indicator</span>
                    <Typography>Click on components to add them to your form</Typography>
                  </div>
                ) : (
                  form.components.map((component, index) => renderComponent(component, index))
                )}
              </div>
            </Box>

            {/* Right panel - Form preview */}
            <Box className="w-1/4 overflow-y-auto p-4">
              <Typography variant="h6" className="mb-4">
                Preview
              </Typography>
              <FormPreview form={form} />
            </Box>
          </>
        )}

        {activeTab === 1 && (
          <Box className="w-full overflow-y-auto p-4">
            <Typography variant="h6" className="mb-4">
              Form Settings
            </Typography>
            {renderFormSettings()}
          </Box>
        )}

        {activeTab === 2 && (
          <Box className="w-full overflow-y-auto p-4">
            <Typography variant="h6" className="mb-4">
              Workflow Editor
            </Typography>
            {renderWorkflowEditor()}
          </Box>
        )}

        {activeTab === 3 && (
          <Box className="w-full overflow-y-auto p-4">
            <Typography variant="h6" className="mb-4">
              Form Preview
            </Typography>
            <FormProvider {...formMethods}>
              <FormPreview form={form} isInteractive={true} />
            </FormProvider>
          </Box>
        )}
      </Box>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Form Preview
          <IconButton
            aria-label="close"
            onClick={() => setPreviewOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FormProvider {...formMethods}>
            <FormPreview form={form} isInteractive={true} />
          </FormProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Code Dialog */}
      <Dialog open={codeDialogOpen} onClose={() => setCodeDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Script Editor
          <IconButton
            aria-label="close"
            onClick={() => setCodeDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className="mb-4">
            <Tabs
              value={scriptType}
              onChange={(e, newValue) => setScriptType(newValue)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="JavaScript" value="js" />
              <Tab label="Groovy" value="groovy" />
            </Tabs>
          </div>

          <SimpleCodeEditor value={scriptCode} onChange={setScriptCode} height={400} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCodeDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              if (scriptType === "js") {
                handleRunJsCode()
              } else {
                handleRunGroovyCode()
              }
              setCodeDialogOpen(false)
            }}
          >
            Run Code
          </Button>
        </DialogActions>
      </Dialog>

      {/* Workflow Dialog */}
      <Dialog open={workflowDialogOpen} onClose={() => setWorkflowDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Workflow Editor
          <IconButton
            aria-label="close"
            onClick={() => setWorkflowDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>{renderWorkflowEditor()}</DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkflowDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setWorkflowDialogOpen(false)
              setSnackbarMessage("Workflow saved!")
              setSnackbarSeverity("success")
              setSnackbarOpen(true)
            }}
          >
            Save Workflow
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Configuration Dialog */}
      <Dialog open={actionConfigOpen} onClose={() => setActionConfigOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {actionTypes.find((a) => a.id === currentActionType)?.label || "Action"} Configuration
          <IconButton
            aria-label="close"
            onClick={() => setActionConfigOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        {renderActionConfigForm()}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default FormBuilderPage

