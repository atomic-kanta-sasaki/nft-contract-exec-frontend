import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import ImgList from './ImgList'

export default function SimpleContainer() {
  return (
    <React.Fragment>
      <CssBaseline />
      <Container fixed>
        <ImgList />
      </Container>
    </React.Fragment>
  );
}