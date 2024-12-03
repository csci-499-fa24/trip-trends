import { React, useState, useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import '../../css/navbar.css';

const NavBarComponent = ({ tripId, userRole, tripName, pointerDisabled = false }) => {
    const [activeLink, setActiveLink] = useState(`/singletrip?tripId=${tripId}`);
    const [isPointerDisabled, setIsPointerDisabled] = useState(pointerDisabled);

    const handleActiveLink = () => {
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            if (path === '/gallery') {
                setActiveLink('gallery');
            } 
            else if (path === '/todo') {
                setActiveLink('todo');
            } 
            else if (path === '/discover') {
                setActiveLink('discover');
            } 
            else if (path === '/flights') {
                setActiveLink('flights');
            }
            else {
                setActiveLink(`/singletrip?tripId=${tripId}`);
            }
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            handleActiveLink();
        }
    }, []);

    return (
        <div style={{ marginLeft: '2%', marginTop: '1%' }}>
            <Navbar expand="lg" variant="light">
                <Container>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none', pointerEvents: isPointerDisabled ? 'none' : 'auto'}}/>
                    <Navbar.Collapse id="basic-navbar-nav">
                    <Nav>
                        <Nav.Link
                            className={activeLink === `/singletrip?tripId=${tripId}` ? 'active' : ''}
                            onClick={() => { setActiveLink(`/singletrip?tripId=${tripId}`), window.location.href = `/singletrip?tripId=${tripId}`;
                            }}>
                            {tripName} Home
                        </Nav.Link>
                        <Nav.Link
                            className={activeLink === 'gallery' ? 'active' : ''}
                            onClick={() => { setActiveLink('gallery'), window.location.href = `/gallery?tripId=${tripId}&userRole=${userRole}`;
                            }}>
                            Gallery
                        </Nav.Link>
                        <Nav.Link
                            className={activeLink === 'todo' ? 'active' : ''}
                            onClick={() => { setActiveLink('todo'), window.location.href = `/todo?tripId=${tripId}`;
                            }}>
                            Lists
                        </Nav.Link>
                        <Nav.Link
                            className={activeLink === 'discover' ? 'active' : ''}
                            onClick={() => { setActiveLink('discover'), window.location.href = `/discover?tripId=${tripId}`;
                            }}>
                            Activities
                        </Nav.Link>
                        <Nav.Link
                            className={activeLink === 'flights' ? 'active' : ''}
                            onClick={() => { setActiveLink('flights'), window.location.href = `/flights?tripId=${tripId}`;
                            }}>
                            Flights
                        </Nav.Link>
                    </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </div>
    );
};

export default NavBarComponent;
