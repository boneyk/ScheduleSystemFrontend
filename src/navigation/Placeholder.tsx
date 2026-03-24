import React from 'react';

import InboxIcon from '@mui/icons-material/Inbox';
import { Box, Stack, Typography } from '@mui/material';

interface PlaceholderProps {
  text: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ text }) => {
  return (
    <Box minHeight="60vh" display="flex" alignItems="center" justifyContent="center">
      <Stack spacing={2} alignItems="center" textAlign="center">
        <InboxIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
        <Typography color="text.secondary">{text}</Typography>
      </Stack>
    </Box>
  );
};

export default Placeholder;
