const db = require('../config/db');

// GET /api/jobs (Public: list open jobs for careers.html)
exports.getPublicJobs = async (req, res) => {
  try {
    const { department, type } = req.query;
    let query = `
      SELECT id, title, department, job_type, location, experience_level, salary_range, description, created_at
      FROM jobs 
      WHERE status = 'open'
    `;
    const params = [];

    if (department && department !== 'all') {
      params.push(department);
      query += ` AND department = $${params.length}`;
    }

    if (type && type !== 'all') {
      params.push(type);
      query += ` AND job_type = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error('Error in getPublicJobs:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/jobs/:id (Public: single job details)
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM jobs WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error in getJobById:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/jobs/admin/all (HR only: get all jobs with applicant counts)
exports.getAllJobsAdmin = async (req, res) => {
  try {
    const query = `
      SELECT j.*, COUNT(a.id)::int AS applicant_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `;
    const result = await db.query(query);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error('Error in getAllJobsAdmin:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// POST /api/jobs (HR only: create job)
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      department,
      job_type,
      location,
      experience_level,
      salary_range,
      description,
      requirements,
      responsibilities,
      status,
    } = req.body;

    if (!title || !department || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, department, and description are required',
      });
    }

    const query = `
      INSERT INTO jobs 
      (title, department, job_type, location, experience_level, salary_range, description, requirements, responsibilities, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      title.trim(),
      department.trim(),
      job_type || 'Full-Time',
      location || 'Phnom Penh, Cambodia',
      experience_level || 'Mid-Level',
      salary_range || 'Negotiable',
      description,
      requirements || null,
      responsibilities || null,
      status || 'open',
    ];

    const result = await db.query(query, values);
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error in createJob:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PUT /api/jobs/:id (HR only: update job)
exports.updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      department,
      job_type,
      location,
      experience_level,
      salary_range,
      description,
      requirements,
      responsibilities,
      status,
    } = req.body;

    const query = `
      UPDATE jobs
      SET title = COALESCE($1, title),
          department = COALESCE($2, department),
          job_type = COALESCE($3, job_type),
          location = COALESCE($4, location),
          experience_level = COALESCE($5, experience_level),
          salary_range = COALESCE($6, salary_range),
          description = COALESCE($7, description),
          requirements = COALESCE($8, requirements),
          responsibilities = COALESCE($9, responsibilities),
          status = COALESCE($10, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `;

    const values = [
      title,
      department,
      job_type,
      location,
      experience_level,
      salary_range,
      description,
      requirements,
      responsibilities,
      status,
      id,
    ];

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error in updateJob:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/jobs/:id (HR only: delete job)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM jobs WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({
      success: true,
      message: 'Job deleted successfully',
    });
  } catch (err) {
    console.error('Error in deleteJob:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

