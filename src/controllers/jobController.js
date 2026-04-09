const pool = require('../config/db');

// Ghost logic: if status is 'applied' and applied_date > 15 days ago → ghost
const GHOST_DAYS = 15;

// Helper: auto-mark ghost in DB for a user's stale applied jobs
const syncGhostJobs = async (userId) => {
  await pool.query(
    `UPDATE jobs
     SET status = 'ghost'
     WHERE user_id = $1
       AND status = 'applied'
       AND applied_date <= NOW() - INTERVAL '${GHOST_DAYS} days'`,
    [userId]
  );
};

// GET /api/jobs — get all jobs for the logged-in user
const getJobs = async (req, res) => {
  try {
    await syncGhostJobs(req.user.id);

    const { status, platform, search } = req.query;
    let query = `SELECT * FROM jobs WHERE user_id = $1`;
    const params = [req.user.id];
    let i = 2;

    if (status) {
      query += ` AND status = $${i++}`;
      params.push(status);
    }
    if (platform) {
      query += ` AND LOWER(platform) = LOWER($${i++})`;
      params.push(platform);
    }
    if (search) {
      query += ` AND (LOWER(company) LIKE $${i} OR LOWER(role) LIKE $${i})`;
      params.push(`%${search.toLowerCase()}%`);
      i++;
    }

    query += ` ORDER BY applied_date DESC`;

    const result = await pool.query(query, params);
    res.json({ jobs: result.rows });
  } catch (err) {
    console.error('GetJobs error:', err.message);
    res.status(500).json({ error: 'Failed to fetch jobs.' });
  }
};

// GET /api/jobs/:id — get a single job
const getJobById = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM jobs WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Job not found.' });

    res.json({ job: result.rows[0] });
  } catch (err) {
    console.error('GetJobById error:', err.message);
    res.status(500).json({ error: 'Failed to fetch job.' });
  }
};

// POST /api/jobs — add a new job
const createJob = async (req, res) => {
  const { company, role, platform, applied_date, notes, job_url } = req.body;

  if (!company || !role || !platform || !applied_date)
    return res.status(400).json({ error: 'Company, role, platform, and applied_date are required.' });

  try {
    // Check if already ghost on creation day (edge case: old date entered)
    const date = new Date(applied_date);
    const daysDiff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
    const status = daysDiff > GHOST_DAYS ? 'ghost' : 'applied';

    const result = await pool.query(
      `INSERT INTO jobs (user_id, company, role, platform, status, applied_date, notes, job_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, company, role, platform, status, applied_date, notes || null, job_url || null]
    );

    res.status(201).json({ job: result.rows[0] });
  } catch (err) {
    console.error('CreateJob error:', err.message);
    res.status(500).json({ error: 'Failed to create job.' });
  }
};

// PUT /api/jobs/:id — update a job
const updateJob = async (req, res) => {
  const { company, role, platform, status, applied_date, notes, job_url } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM jobs WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (existing.rows.length === 0)
      return res.status(404).json({ error: 'Job not found.' });

    const job = existing.rows[0];

    const result = await pool.query(
      `UPDATE jobs SET
        company = $1, role = $2, platform = $3, status = $4,
        applied_date = $5, notes = $6, job_url = $7
       WHERE id = $8 AND user_id = $9
       RETURNING *`,
      [
        company || job.company,
        role || job.role,
        platform || job.platform,
        status || job.status,
        applied_date || job.applied_date,
        notes !== undefined ? notes : job.notes,
        job_url !== undefined ? job_url : job.job_url,
        req.params.id,
        req.user.id,
      ]
    );

    res.json({ job: result.rows[0] });
  } catch (err) {
    console.error('UpdateJob error:', err.message);
    res.status(500).json({ error: 'Failed to update job.' });
  }
};

// DELETE /api/jobs/:id — delete a job
const deleteJob = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM jobs WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Job not found.' });

    res.json({ message: 'Job deleted successfully.' });
  } catch (err) {
    console.error('DeleteJob error:', err.message);
    res.status(500).json({ error: 'Failed to delete job.' });
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob };
