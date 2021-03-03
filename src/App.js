import {Latest} from './Latest';
import {History} from './History';

import { Navbar, Nav } from 'react-bootstrap';

import {
	BrowserRouter as Router,
	Switch,
	Route,
	Redirect
} from "react-router-dom";

function App() {
	return (
		<Router>
			<div className="App bg-secondary text-light">
				<Navbar bg="dark" variant="dark" expand="lg">
					<Navbar.Brand href="/">StockViva Test</Navbar.Brand>
					<Navbar.Toggle aria-controls="basic-navbar-nav" />
					<Navbar.Collapse id="basic-navbar-nav">
						<Nav className="mr-auto">
							<Nav.Link href="/latest">Latest</Nav.Link>
							<Nav.Link href="/history">History</Nav.Link>
						</Nav>
					</Navbar.Collapse>
				</Navbar>
				<div className="container">
					<div className="row text-center">
						<div className="col-12 my-4">
							<Switch>
								<Route path="/latest">
									<Latest />
								</Route>
								<Route path="/history">
									<History />
								</Route>
								<Route path="/">
									<Redirect to="/latest" />
								</Route>
							</Switch>
						</div>
					</div>
				</div>
			</div>
		</Router>
	);
}

export default App;
