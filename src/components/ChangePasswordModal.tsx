import React, { useState } from 'react';
import { Modal, ModalDialog, Typography, Input, Button, Box } from '@mui/joy';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ open, onClose }: ChangePasswordModalProps) {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your password change logic here
    console.log('Changing password:', passwords);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        aria-labelledby="change-password-modal"
        sx={{ maxWidth: 400, padding: 3 }}
      >
        <Typography level="h4" component="h2" sx={{ mb: 2 }}>
          Change Password
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Input
              type="password"
              placeholder="Current Password"
              required
              onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="New Password"
              required
              onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
            />
            <Input
              type="password"
              placeholder="Confirm New Password"
              required
              onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
            />
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="plain" color="neutral" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Change Password
              </Button>
            </Box>
          </Box>
        </form>
      </ModalDialog>
    </Modal>
  );
} 