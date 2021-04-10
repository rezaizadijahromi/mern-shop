import react from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Container } from "react-bootstrap";
import Header from "./components/Header";

function App() {
  return (
    <Router>
      <main className="py-3">
        <Container>
          <Header />
        </Container>
      </main>
    </Router>
  );
}

export default App;
