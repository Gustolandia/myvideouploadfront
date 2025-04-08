import React, { useState, useRef } from "react";
import { Container, Row, Col, Button, Alert, Form } from "react-bootstrap";

function Upload() {
  // Minimal state: only messages, file selection and scheduled date/time.
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [scheduledAt, setScheduledAt] = useState("");

  // Refs for text inputs (uncontrolled)
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const tagsRef = useRef(null);
  const privacyStatusRef = useRef(null);
  const categoryIdRef = useRef(null);

  // Use a ref for thumbnailOffset to avoid re-rendering on every update
  const thumbnailOffsetRef = useRef(0);

  // Video categories and privacy options
  const videoCategories = [
    { name: "Film & Animation", value: "1" },
    { name: "Autos & Vehicles", value: "2" },
    { name: "Music", value: "10" },
    { name: "Pets & Animals", value: "15" },
    { name: "Sports", value: "17" },
    { name: "Short Movies", value: "18" },
    { name: "Travel & Events", value: "19" },
    { name: "Gaming", value: "20" },
    { name: "Videoblogging", value: "21" },
    { name: "People & Blogs", value: "22" },
    { name: "Comedy", value: "23" },
    { name: "Entertainment", value: "24" },
    { name: "News & Politics", value: "25" },
    { name: "Howto & Style", value: "26" },
    { name: "Education", value: "27" },
    { name: "Science & Technology", value: "28" },
    { name: "Nonprofits & Activism", value: "29" },
    { name: "Movies", value: "30" },
    { name: "Anime/Animation", value: "31" },
    { name: "Action/Adventure", value: "32" },
    { name: "Classics", value: "33" },
    { name: "Documentary", value: "35" },
    { name: "Drama", value: "36" },
    { name: "Family", value: "37" },
    { name: "Foreign", value: "38" },
    { name: "Horror", value: "39" },
    { name: "Sci-Fi/Fantasy", value: "40" },
    { name: "Thriller", value: "41" },
    { name: "Shorts", value: "42" },
    { name: "Shows", value: "43" },
    { name: "Trailers", value: "44" },
  ];

  const privacyOptions = [
    { name: "Default", value: "Default" },
    { name: "Public", value: "public" },
    { name: "Private", value: "private" },
  ];

  // Base URL from .env or fallback.
  const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

  // Ref for the video element.
  const videoRef = useRef(null);
  // Ref for the read-only input showing thumbnail offset.
  const offsetInputRef = useRef(null);

  // Update thumbnailOffset imperatively when the video time updates.
  const handleTimeUpdate = () => {
    if (videoRef.current && offsetInputRef.current) {
      const currentTimeInMs = Math.floor(videoRef.current.currentTime * 1000);
      thumbnailOffsetRef.current = currentTimeInMs;
      // Update the DOM element without triggering re-renders.
      offsetInputRef.current.value = currentTimeInMs;
    }
  };

  // Handle file changes.
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Handle scheduledAt input changes.
  const handleScheduledAtChange = (e) => {
    setScheduledAt(e.target.value);
  };

  // Retrieve all input values from refs and perform the upload.
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a video file to upload.");
      return;
    }
    const title = titleRef.current.value;
    const description = descriptionRef.current.value;
    const tags = tagsRef.current.value;
    const privacyStatus = privacyStatusRef.current.value;
    const categoryId = categoryIdRef.current.value;

    const formData = new FormData();
    // Note: The new endpoint expects the file under the key "videoFile"
    formData.append("videoFile", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", tags);
    // Only include privacyStatus if not "Default".
    if (privacyStatus !== "Default") {
      formData.append("privacyStatus", privacyStatus);
    }
    formData.append("categoryId", categoryId);
    formData.append("thumbnailOffset", thumbnailOffsetRef.current);
    // Append the scheduled date/time.
    formData.append("scheduledAt", scheduledAt);

    try {
      setMessage("");
      setError("");

      const response = await fetch(`${baseUrl}/cronjobs`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("Cron job created successfully!");
      } else {
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Error during upload:", err);
      setError("Unexpected error: " + err.message);
    }
  };

  return (
    <Container fluid className="p-0">
      {/* Video player container: Always visible on top, with fixed height and black background */}
      <div
        style={{
          backgroundColor: "black",
          height: "500px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {file ? (
          <video
            ref={videoRef}
            style={{ maxHeight: "100%", maxWidth: "100%" }}
            controls
            src={URL.createObjectURL(file)}
            onTimeUpdate={handleTimeUpdate}
          />
        ) : (
          <p style={{ color: "white" }}>Video Player</p>
        )}
      </div>

      <Container className="mt-4">
        <Row>
          <Col>
            <h1>Schedule Video Upload to Multiple Platforms</h1>
            <p>
              Upload your video to be published on YouTube, TikTok, Instagram, Facebook, Threads, and X at a scheduled time!
            </p>

            {/* Video File Upload */}
            <Form.Group>
              <Form.Label>Select Video File</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                accept="video/*"
              />
            </Form.Group>

            {/* Input for Scheduled Date & Time */}
            <Form.Group>
              <Form.Label>Scheduled Date &amp; Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={scheduledAt}
                onChange={handleScheduledAtChange}
              />
            </Form.Group>

            {/* Video Information - Uncontrolled fields via refs */}
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter video title"
                ref={titleRef}
                defaultValue=""
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter video description"
                ref={descriptionRef}
                defaultValue=""
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Tags (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter tags"
                ref={tagsRef}
                defaultValue=""
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Privacy Status</Form.Label>
              <Form.Control
                as="select"
                ref={privacyStatusRef}
                defaultValue="public"
              >
                {privacyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Control as="select" ref={categoryIdRef} defaultValue="1">
                {videoCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* Read-only display for thumbnail offset */}
            <Form.Group>
              <Form.Label>Thumbnail Offset (in ms)</Form.Label>
              <Form.Control
                ref={offsetInputRef}
                plaintext
                readOnly
                defaultValue={0}
              />
            </Form.Group>

            {/* Upload Button */}
            <Button className="m-2" onClick={handleUpload}>
              Schedule Video Upload
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
    </Container>
  );
}

export default Upload;
