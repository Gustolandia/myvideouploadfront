import React, { useState, useRef, useEffect } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import {
  Container,
  Row,
  Col,
  Button,
  Alert,
  Form,
  ProgressBar,
  Spinner,
} from "react-bootstrap";

function Upload() {
  // Minimal state: only messages and file selection.
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // scheduledAt as a ref instead of state
  const scheduledAtRef = useRef(null);

  const ffmpegLoadedRef = useRef(false);

  // Refs for uncontrolled inputs
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const tagsRef = useRef(null);
  const privacyStatusRef = useRef(null);
  const categoryIdRef = useRef(null);

  // Thumbnail offset & video refs
  const thumbnailOffsetRef = useRef(0);
  const videoRef = useRef(null);
  const offsetInputRef = useRef(null);
  const totalFramesRef = useRef(0);

  // Video categories and privacy options (unchanged)
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

  const baseUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

  // FFmpeg setup (use the factory, not `new`)
  const ffmpeg = useRef(new FFmpeg({ log: true })).current;

  useEffect(() => {
    const onLog = ({ message }) => {
      const m = message.match(/frame=\s*(\d+)/);
      if (m && totalFramesRef.current) {
        const current = parseInt(m[1], 10);
        const pct = Math.round((current / totalFramesRef.current) * 100);
        console.log(
          `⚡ manual progress: ${current}/${totalFramesRef.current} → ${pct}%`
        );
        setProgress(pct);
      }
    };

    ffmpeg.on("log", onLog);
    return () => {
      ffmpeg.off("log", onLog);
    };
  }, [ffmpeg]);

  const MAX_MS = 2 * 60 * 1000 + 20 * 1000 - 1; // 140 000 ms − 1
  const TARGET_W = 720;
  const TARGET_H = 1280;

  // Update thumbnailOffset without re-render
  const handleTimeUpdate = () => {
    if (videoRef.current && offsetInputRef.current) {
      const ms = Math.floor(videoRef.current.currentTime * 1000);
      thumbnailOffsetRef.current = ms;
      offsetInputRef.current.value = String(ms);
    }
  };

  // File selector + auto‑reformat
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0] || null;
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Probe dimensions & duration
    const probe = document.createElement("video");
    probe.src = URL.createObjectURL(selectedFile);
    await new Promise((res) => (probe.onloadedmetadata = res));
    const w = probe.videoWidth,
      h = probe.videoHeight,
      duration = probe.duration;
    URL.revokeObjectURL(probe.src);

    const isVertical = h / w >= 16 / 9;
    const durationMs = Math.floor(duration * 1000);

    if (!isVertical || durationMs > MAX_MS) {
      const ok = window.confirm(
        `Your clip is ${w}×${h}, ${Math.round(durationMs / 1000)}s long.\n` +
          `Shorts require 9:16 and ≤ 140 000 ms.\nRe‑format now?`
      );
      if (!ok) {
        setFile(null);
        return;
      }

      try {
        setIsPreparing(true);

        // Load FFmpeg if not already loaded
        if (!ffmpegLoadedRef.current) {
          await ffmpeg.load();
          ffmpegLoadedRef.current = true;
        }

        // Write input file
        const buf = new Uint8Array(await selectedFile.arrayBuffer());
        console.log("🧪 Input file size:", buf.length);

        try {
          await ffmpeg.writeFile("in.mp4", buf);
        } catch (err) {
          console.error("❌ Failed to write in.mp4:", err);
          alert("Error writing video into FFmpeg memory.");
          return;
          setIsPreparing(false);
        }

        // Verify file exists
        const files = await ffmpeg.listDir("/");
        console.log("📂 FFmpeg root contents:", files);
        const hasInput = files.some(
          (file) => file.name === "in.mp4" && !file.isDir
        );
        if (!hasInput) {
          throw new Error("'in.mp4' not found in FFmpeg virtual filesystem.");
        }

        let frameOutput = "";
        const logHandler = ({ type, message }) => {
          if (type === "stdout" || type === "stderr") {
            frameOutput += message + "\n";
          }
        };
        ffmpeg.on("log", logHandler);

        // Run a dummy conversion to count frames (emit progress)
        await ffmpeg.exec([
          "-i",
          "in.mp4",
          "-f",
          "null",
          "-progress",
          "pipe:1",
          "-",
        ]);

        ffmpeg.off("log", logHandler);

        // Extract last "frame=" entry from logs
        const lines = frameOutput.split("\n");
        const lastFrameLine = lines
          .reverse()
          .find((line) => line.startsWith("frame="));
        if (!lastFrameLine) {
          throw new Error("Could not extract frame count from FFmpeg output.");
        }
        totalFramesRef.current = parseInt(
          lastFrameLine.replace("frame=", "").trim(),
          10
        );
        console.log("🎯 Total frames =", totalFramesRef.current);

        // Build filter: scale and pad
        const padFilter =
          `scale=${TARGET_W}:-2,` +
          `pad=${TARGET_W}:${TARGET_H}:(ow-iw)/2:(oh-ih)/2:black`;

        const args = [
          "-i",
          "in.mp4",
          "-vf",
          padFilter,
          "-t",
          (MAX_MS / 1000).toFixed(3),
          "-c:a",
          "copy",
          "out.mp4",
        ];

        console.log("🚀 Starting ffmpeg.exec with:", args);
        setIsPreparing(false);

        setIsProcessing(true);
        await ffmpeg.exec(args);
        console.log("✅ ffmpeg.exec complete");
        setIsProcessing(false);

        // Read result
        const data = await ffmpeg.readFile("out.mp4");
        const blob = new Blob([data], { type: "video/mp4" });
        const newFile = new File([blob], selectedFile.name, {
          type: "video/mp4",
        });

        setFile(newFile);
        ffmpeg.off("log", logHandler);
        return;
      } catch (err) {
        console.error("❌ FFmpeg processing failed:", err);
        alert(
          "An error occurred during video processing.\nDetails: " + err.message
        );
        setIsProcessing(false);
        setIsPreparing(false);

        setFile(null);
        return;
      }
    }

    console.log("✅ File meets criteria, using original");
    setFile(selectedFile);
  };

  // Build form data & post
  const handleUpload = async () => {
    if (!file) {
      setError("Please select a video file to upload.");
      return;
    }
    const title = titleRef.current?.value;
    const description = descriptionRef.current?.value;
    const tags = tagsRef.current?.value;
    const privacyStatus = privacyStatusRef.current?.value;
    const categoryId = categoryIdRef.current?.value;
    const scheduledAt = scheduledAtRef.current?.value;

    const formData = new FormData();
    formData.append("videoFile", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", tags);
    if (privacyStatus !== "Default") {
      formData.append("privacyStatus", privacyStatus);
    }
    formData.append("categoryId", categoryId);
    formData.append("thumbnailOffset", String(thumbnailOffsetRef.current));
    formData.append("scheduledAt", scheduledAt);

    setMessage("");
    setError("");
    try {
      const res = await fetch(`${baseUrl}/cronjobs`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) setMessage("Cron job created successfully!");
      else setError(`Error: ${data.error}`);
    } catch (err) {
      console.error(err);
      setError("Unexpected error: " + err.message);
    }
  };

  return (
    <Container fluid className="p-0">
      {isPreparing && !isProcessing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            flexDirection: "column",
            color: "white",
            fontSize: "1.5rem",
            fontWeight: "bold",
          }}
        >
          <Spinner
            animation="border"
            role="status"
            variant="light"
            style={{ width: "3rem", height: "3rem", marginBottom: "1rem" }}
          />
          Preparing video... This operation might take some minutes. 
        </div>
      )}

      {isProcessing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <ProgressBar
            now={progress}
            label={`${progress}%`}
            variant="info"
            animated
            striped
            style={{ width: "50%" }}
          />
        </div>
      )}

      {/* Video preview */}
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
            style={{ height: "100%", width: "auto" }}
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
              Upload your video to be published on YouTube, TikTok, Instagram,
              Facebook, Threads, and X at a scheduled time!
            </p>

            {/* File input */}
            <Form.Group>
              <Form.Label>Select Video File</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                accept="video/*"
              />
            </Form.Group>

            {/* Scheduled time */}
            <Form.Group>
              <Form.Label>Scheduled Date &amp; Time</Form.Label>
              <Form.Control type="datetime-local" ref={scheduledAtRef} />
            </Form.Group>

            {/* Title */}
            <Form.Group>
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter video title"
                ref={titleRef}
              />
            </Form.Group>

            {/* Description */}
            <Form.Group>
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter video description"
                ref={descriptionRef}
              />
            </Form.Group>

            {/* Tags */}
            <Form.Group>
              <Form.Label>Tags (comma-separated)</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter tags"
                ref={tagsRef}
              />
            </Form.Group>

            {/* Privacy */}
            <Form.Group>
              <Form.Label>Privacy Status</Form.Label>
              <Form.Control as="select" ref={privacyStatusRef}>
                {privacyOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* Category */}
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Control as="select" ref={categoryIdRef} defaultValue="1">
                {videoCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* Thumbnail offset */}
            <Form.Group>
              <Form.Label>Thumbnail Offset (ms)</Form.Label>
              <Form.Control
                plaintext
                readOnly
                ref={offsetInputRef}
                defaultValue="0"
              />
            </Form.Group>

            {/* Upload */}
            <Button className="m-2" onClick={handleUpload}>
              Schedule Video Upload
            </Button>

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
