import React, { useEffect, useState, useCallback } from 'react';
import { Table, Container, Button, Alert, Spinner } from 'react-bootstrap';

const CronJobsTable = () => {
  const [cronJobs, setCronJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get the token from an environment variable.
  // In Create React App, the env variable must be prefixed with REACT_APP_
  const CRON_JOB_API_KEY = process.env.REACT_APP_CRON_JOB_API_KEY;

  // Function to format Unix timestamps (in seconds) to a human-readable format.
  const formatUnixTimestamp = (ts) => {
    if (!ts || ts === 0) return "N/A";
    return new Date(ts * 1000).toLocaleString();
  };

  // Wrap fetchCronJobs in useCallback to keep it stable.
  const fetchCronJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.cron-job.org/jobs', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${CRON_JOB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        // According to the docs, the cron jobs are returned under "jobs"
        setCronJobs(data.jobs || []);
      } else {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${text}`);
      }
    } catch (err) {
      console.error("Error fetching cron jobs:", err);
      setError(err.message || "Error fetching cron jobs");
    } finally {
      setLoading(false);
    }
  }, [CRON_JOB_API_KEY]);

  useEffect(() => {
    fetchCronJobs();
  }, [fetchCronJobs]);

  // Function to delete a cron job using the DELETE API endpoint.
  const deleteCronJob = async (jobId) => {
    try {
      const response = await fetch(`https://api.cron-job.org/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${CRON_JOB_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete job ${jobId}: HTTP error ${response.status}`);
      }

      // Remove the deleted job from state without re-fetching.
      setCronJobs((prevJobs) => prevJobs.filter((job) => job.jobId !== jobId));
    } catch (err) {
      console.error("Error deleting cron job:", err);
      setError(err.message || "Error deleting cron job");
    }
  };

  return (
    <Container className="mt-4">
      <h2>Cron Jobs</h2>
      {loading && (
        <div className="mb-3">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      <Button variant="primary" onClick={fetchCronJobs} className="mb-3">
        Refresh
      </Button>
      {(!loading && cronJobs.length === 0) ? (
        <Alert variant="info">No cron jobs found.</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Title</th>
              <th>URL</th>
              <th>Enabled</th>
              <th>Last Execution</th>
              <th>Next Execution</th>
              <th>Schedule</th>
              <th>Extended Data</th>
              <th>Request Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cronJobs.map((job) => (
              <tr key={job.jobId}>
                <td>{job.jobId}</td>
                <td>{job.title || 'N/A'}</td>
                <td>{job.url}</td>
                <td>{job.enabled ? 'Yes' : 'No'}</td>
                <td>{formatUnixTimestamp(job.lastExecution)}</td>
                <td>{formatUnixTimestamp(job.nextExecution)}</td>
                <td>
                  {job.schedule ? (
                    <>
                      <div>Expires: {job.schedule.expiresAt || 'N/A'}</div>
                      <div>Hours: {job.schedule.hours.join(', ')}</div>
                      <div>Minutes: {job.schedule.minutes.join(', ')}</div>
                      <div>TimeZone: {job.schedule.timezone}</div>
                    </>
                  ) : 'N/A'}
                </td>
                <td>
                  {job.extendedData && job.extendedData.body 
                    ? job.extendedData.body 
                    : 'N/A'}
                </td>
                <td>{job.requestMethod}</td>
                <td>
                  <Button variant="danger" size="sm" onClick={() => deleteCronJob(job.jobId)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default CronJobsTable;
