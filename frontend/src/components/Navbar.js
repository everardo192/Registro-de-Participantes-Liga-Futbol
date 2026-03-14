import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';

const Navigation = () => {
  const location = useLocation();

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">Liga de Fútbol</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={location.pathname === '/'}>
              Inicio
            </Nav.Link>
            <Nav.Link as={Link} to="/equipos" active={location.pathname === '/equipos'}>
              Equipos
            </Nav.Link>
            <Nav.Link as={Link} to="/participantes" active={location.pathname === '/participantes'}>
              Participantes
            </Nav.Link>
            <Nav.Link as={Link} to="/partidos" active={location.pathname === '/partidos'}>
              Partidos
            </Nav.Link>
            <Nav.Link as={Link} to="/consultas" active={location.pathname === '/consultas'}>
              Consultas
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;