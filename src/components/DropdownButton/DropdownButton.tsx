import { ReactNode, useEffect, useId, useRef } from 'react';

import { Button, Grid2 } from '@mui/material';
import classNames from 'classnames';

import styles from './DropdownButton.module.scss';
import { useDropdownContext } from './DropdownContext';

interface DropdownButtonProps {
  items: Record<string, () => void>;
  icon?: ReactNode;
}

const DropdownButton = ({ items, icon }: DropdownButtonProps) => {
  const id = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { activeId, setActiveId } = useDropdownContext();
  const isOpen = activeId === id;

  const handleToggle = () => {
    setActiveId(isOpen ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setActiveId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setActiveId]);

  return (
    <Grid2 container className={styles.wrapper} ref={wrapperRef}>
      <Grid2 container className={classNames(styles.dropdownMenu, { [styles.hidden]: !isOpen })}>
        {Object.entries(items).map(([label, onClick]) => (
          <Button key={label} onClick={onClick}>
            {label}
          </Button>
        ))}
      </Grid2>
      <Button variant="contained" color="primary" className={styles.triggerButton} onClick={handleToggle} size="small">
        {icon}
      </Button>
    </Grid2>
  );
};

export default DropdownButton;
