import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { ArrowUpward, Remove, ArrowDownward } from '@mui/icons-material';

type Priority = 'high' | 'medium' | 'low';

interface PriorityChipProps extends Omit<ChipProps, 'color'> {
  priority: Priority;
}

const PriorityChip: React.FC<PriorityChipProps> = ({ priority, ...props }) => {
  const getPriorityProps = (): { icon: React.ReactNode; label: string; color: ChipProps['color'] } => {
    switch (priority) {
      case 'high':
        return {
          icon: <ArrowUpward fontSize="small" />,
          label: 'High',
          color: 'error' as const,
        };
      case 'medium':
        return {
          icon: <Remove fontSize="small" />,
          label: 'Medium',
          color: 'warning' as const,
        };
      case 'low':
        return {
          icon: <ArrowDownward fontSize="small" />,
          label: 'Low',
          color: 'success' as const,
        };
      default:
        return {
          icon: <Remove fontSize="small" />,
          label: 'Medium',
          color: 'default' as const,
        };
    }
  };

  const { icon, label, color } = getPriorityProps();

  return (
    <Chip
      size="small"
      {...(icon ? { icon: icon as React.ReactElement } : {})}
      label={label}
      color={color}
      variant="outlined"
      sx={{ 
        borderRadius: 1,
        '& .MuiChip-icon': {
          color: 'inherit',
        },
      }}
      {...props}
    />
  );
};

export default PriorityChip;
