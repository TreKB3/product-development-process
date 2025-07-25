import React, { CSSProperties, ReactNode, useCallback } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { 
  Box, 
  ListItem, 
  ListItemProps, 
  ListItemText, 
  SxProps, 
  Theme,
  ListItemButton,
  ListItemButtonProps
} from '@mui/material';

export interface VirtualizedListItem {
  id: string | number;
  primary: ReactNode;
  secondary?: ReactNode;
  [key: string]: any;
}

interface VirtualizedListProps<T extends VirtualizedListItem> {
  items: T[];
  itemHeight?: number;
  renderItem?: (item: T, style: CSSProperties) => ReactNode;
  onItemClick?: (item: T) => void;
  emptyState?: ReactNode;
  sx?: SxProps<Theme>;
  listItemProps?: Omit<ListItemButtonProps, 'onClick'>;
}

const defaultRenderItem = <T extends VirtualizedListItem>(
  item: T,
  style: CSSProperties,
  onClick?: (item: T) => void,
  listItemProps?: Omit<ListItemButtonProps, 'onClick'>
) => {
  const ListItemComponent: React.ElementType = onClick ? ListItemButton : ListItem;
  const itemProps = {
    ...listItemProps,
    onClick: onClick ? () => onClick(item) : undefined,
    style,
    key: item.id.toString(),
    component: 'div' as const
  };

  return (
    <ListItemComponent {...itemProps}>
      <ListItemText 
        primary={item.primary} 
        secondary={item.secondary} 
        primaryTypographyProps={{ noWrap: true }}
        secondaryTypographyProps={{ noWrap: true }}
      />
    </ListItemComponent>
  );
};

/**
 * A performant virtualized list component for rendering large datasets efficiently.
 * Uses react-window under the hood with Material-UI components.
 */
function VirtualizedList<T extends VirtualizedListItem>({
  items,
  itemHeight = 72,
  renderItem,
  onItemClick,
  emptyState,
  sx,
  listItemProps,
}: VirtualizedListProps<T>) {
  // If no items and empty state is provided, render the empty state
  if (items.length === 0 && emptyState) {
    return <Box sx={{ p: 2, ...sx }}>{emptyState}</Box>;
  }

  // Default render function if none provided
  const renderRow = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = items[index];
    const itemRenderer = renderItem || defaultRenderItem;
    
    return itemRenderer(
      item,
      style,
      onItemClick,
      listItemProps
    ) as React.ReactElement;
  }, [items, onItemClick, listItemProps, renderItem]);

  return (
    <Box sx={{ height: '100%', width: '100%', ...sx }}>
      <AutoSizer>
        {({ height, width }: { height: number; width: number }) => (
          <List
            height={height}
            itemCount={items.length}
            itemSize={itemHeight}
            width={width}
            overscanCount={5}
          >
            {renderRow}
          </List>
        )}
      </AutoSizer>
    </Box>
  );
}

export default React.memo(VirtualizedList) as typeof VirtualizedList;
