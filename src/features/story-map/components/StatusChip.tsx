import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, Cached } from '@mui/icons-material';

type Status = 'todo' | 'in-progress' | 'done';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: Status;
}

const StatusChip: React.FC<StatusChipProps> = ({ status, ...props }) => {
  const getStatusProps = (): { 
    icon: React.ReactNode; 
    label: string; 
    color: ChipProps['color'];
    variant: ChipProps['variant'];
  } => {
    switch (status) {
      case 'todo':
        return {
          icon: <RadioButtonUnchecked fontSize="small" />,
          label: 'To Do',
          color: 'default' as const,
          variant: 'outlined' as const,
        };
      case 'in-progress':
        return {
          icon: <Cached fontSize="small" />,
          label: 'In Progress',
          color: 'primary' as const,
          variant: 'outlined' as const,
        };
      case 'done':
        return {
          icon: <CheckCircle fontSize="small" />,
          label: 'Done',
          color: 'success' as const,
          variant: 'filled' as const,
        };
      default:
        return {
          icon: <RadioButtonUnchecked fontSize="small" />,
          label: 'To Do',
          color: 'default' as const,
          variant: 'outlined' as const,
        };
    }
  };

  const { icon, label, color, variant } = getStatusProps();

  return (
    <Chip
      size="small"
      icon={icon as React.ReactElement}
      label={label}
      color={color}
      variant={variant}
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

export default StatusChip;
