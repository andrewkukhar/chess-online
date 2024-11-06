import React, { useContext, useState } from "react";
import { NotificationContext } from "../../contexts/NotificationContext";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { useSendGameLinkMutation } from "../../services/api-services/email";

const InvitatioDialog = ({ open, onClose, gameId }) => {
  const { addNotification } = useContext(NotificationContext);
  const [sendGameLink, { isLoading }] = useSendGameLinkMutation();
  const [inviteEmail, setInviteEmail] = useState("");

  const handleSendInvite = async () => {
    const result = await sendGameLink({ email: inviteEmail, gameId });
    if (result && result?.data) {
      addNotification(
        result?.data?.message || "Invitation sent successfully.",
        "success"
      );
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      addNotification(
        result?.error?.data?.message ||
          "Failed to send invitation. Please try again.",
        "error"
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Invite a Friend to Play</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Recipient Email"
          type="email"
          fullWidth
          variant="outlined"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSendInvite} color="primary" disabled={isLoading}>
          {isLoading ? <CircularProgress /> : "Send Invite"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvitatioDialog;
