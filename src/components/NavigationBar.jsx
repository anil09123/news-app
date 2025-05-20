import React, { useState } from 'react';
import { Navbar, Container, Nav, Form } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function NavigationBar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearch(query);

    if (query.trim() === '') {
      navigate('/'); 
    } else {
      navigate(`/search/${query}`);  
    }
  };

  return (
    <Navbar bg={isDarkMode ? 'dark' : 'light'} variant={isDarkMode ? 'dark' : 'light'} expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">News App</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/category/technology">Technology</Nav.Link>
            <Nav.Link as={Link} to="/category/sports">Sports</Nav.Link>
            <Nav.Link as={Link} to="/category/business">Business</Nav.Link>
          </Nav>
          <Form className="d-flex">
            <Form.Control
              type="search"
              placeholder="Search news..."
              className="me-2"
              aria-label="Search"
              value={search}
              onChange={handleSearch} 
            />
          </Form>
          <br />
          <button onClick={toggleTheme} className="btn btn-outline-primary ms-2 ">
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;
