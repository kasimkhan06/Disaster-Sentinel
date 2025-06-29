import * as React from 'react';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { styled } from '@mui/system';

export default function MaxHeightTextarea({placeholder}) {
  const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025',
  };

  const Textarea = styled(BaseTextareaAutosize)(
    ({ theme }) => `
    box-sizing: border-box;
    width: 100%;
    min-height: 100px;
    resize: none;
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.9rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 8px 12px;
    border-radius: 8px;
    color: ${ grey[900] };
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 2px solid ${ grey[200] };
    box-shadow: 0 2px 2px ${theme.palette.mode === 'dark' ? grey[900] : grey[50]};

    &:hover {
      border-color: ${grey[800]};
    }

    &:focus {
      border-color: ${grey[800]};
    }

    /* firefox */
    &:focus-visible {
      outline: 0;
    }
  `,
  );

  return (
    <Textarea
      maxRows={50}
      aria-label="maximum height"
      placeholder={placeholder}
      style={{ width: '100%' }}
      defaultValue=""
    />
  );
}
