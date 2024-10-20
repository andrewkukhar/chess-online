// src/components/helpers/ConfirmationDialog.js
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import PropTypes from "prop-types";

/**
 * A reusable confirmation dialog component using MUI.
 *
 * Props:
 * - open (bool): Controls the visibility of the dialog.
 * - title (string): The title of the dialog.
 * - content (string or node): The content/message of the dialog.
 * - onConfirm (function): Callback when the user confirms the action.
 * - onCancel (function): Callback when the user cancels the action.
 * - confirmText (string): Text for the confirm button (default: "Confirm").
 * - cancelText (string): Text for the cancel button (default: "Cancel").
 */
const ConfirmationDialog = ({
  open,
  title,
  content,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-description"
    >
      {title && (
        <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
      )}
      {content && (
        <DialogContent>
          <DialogContentText id="confirmation-dialog-description">
            {content}
          </DialogContentText>
        </DialogContent>
      )}
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          {cancelText}
        </Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Define prop types for better type checking and documentation
ConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};

export default ConfirmationDialog;
