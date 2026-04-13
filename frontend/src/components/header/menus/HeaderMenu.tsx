import { Paper, Typography, Box } from '@mui/material';
import type { ReactNode } from 'react';

type HeaderMenuProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

function HeaderMenu({ title, children, className = '' }: HeaderMenuProps) {
  return (
    <Paper elevation={8} className={`fb-menu-paper ${className}`}>
      {title ? (
        <Typography variant="h5" className="fb-menu-title">
          {title}
        </Typography>
      ) : null}

      <Box className="fb-menu-body">{children}</Box>
    </Paper>
  );
}

export default HeaderMenu;
