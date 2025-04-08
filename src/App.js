import React, { useState } from "react";
import { Container, Row, Col, Button, Alert } from "react-bootstrap";
import Upload from './Upload';  // Adjust the path if needed
import CronJobsTable from './CronJobsTable';  // Adjust the path if needed

// ^ We’re importing only a few React-Bootstrap components as an example.

function App() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Base URL from .env
  const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

  // A helper function to call any authentication endpoint
  const handleAuth = async (serviceEndpoint) => {
    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${baseUrl}/${serviceEndpoint}/authentication`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        // 200 OK
        setMessage(`${serviceEndpoint} => ${data.message}`);
      } else {
        // Possibly 400 (or something else)
        // The server might have data.authUrl in this scenario
        setError(`${serviceEndpoint} => ${data.error}`);
        if (data.authUrl) {
          // Open new window for user to authenticate
          window.open(data.authUrl, "_blank", "width=600,height=600");
        }
      }
    } catch (err) {
      console.error(`Error calling ${serviceEndpoint}/authentication:`, err);
      setError(`Unexpected error: ${err.message}`);
    }
  };

  return (
    <>
      <Container className="mt-4">
        <Row>
          <Col>
            <h1>Welcome to Auth Demo</h1>
            <p>
              Click a button to authenticate with a service. If you have a valid
              token, you'll see a success message. Otherwise, you'll see an auth
              URL to visit in a popup.
            </p>

            {/* YouTube Auth */}
            <Button className="m-2" onClick={() => handleAuth("youtube")}>
              YouTube Auth
            </Button>

            {/* TikTok Auth */}
            <Button className="m-2" onClick={() => handleAuth("tiktok")}>
              TikTok Auth
            </Button>

            {/* Instagram Auth */}
            <Button className="m-2" onClick={() => handleAuth("ig")}>
              Instagram Auth
            </Button>

            {/* Facebook Auth */}
            <Button className="m-2" onClick={() => handleAuth("facebook")}>
              Facebook Auth
            </Button>

            {/* Threads Auth */}
            <Button className="m-2" onClick={() => handleAuth("threads")}>
              Threads Auth
            </Button>

            {/* X Auth */}
            <Button className="m-2" onClick={() => handleAuth("x")}>
              X Auth
            </Button>

            {/* Display success or error messages */}
            {message && (
              <Alert variant="success" className="mt-3">
                {message}
              </Alert>
            )}
            {error && (
              <Alert variant="danger" className="mt-3">
                {error}
              </Alert>
            )}
          </Col>
        </Row>
      </Container>
      <Upload />
      <CronJobsTable/>
    </>
  );
}

export default App;
