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
      query += ` AND department = ?`;
    }

    if (type && type !== 'all') {
      params.push(type);
      query += ` AND job_type = ?`;
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
    const result = await db.query('SELECT * FROM jobs WHERE id = ?', [id]);

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
      SELECT j.*, CAST(COUNT(a.id) AS UNSIGNED) AS applicant_count
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    // Fetch the newly created job
    const newJob = await db.query('SELECT * FROM jobs WHERE id = ?', [result.rows.insertId]);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: newJob.rows[0],
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
      SET title = COALESCE(?, title),
          department = COALESCE(?, department),
          job_type = COALESCE(?, job_type),
          location = COALESCE(?, location),
          experience_level = COALESCE(?, experience_level),
          salary_range = COALESCE(?, salary_range),
          description = COALESCE(?, description),
          requirements = COALESCE(?, requirements),
          responsibilities = COALESCE(?, responsibilities),
          status = COALESCE(?, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
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

    if (result.rows.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Fetch the updated job
    const updatedJob = await db.query('SELECT * FROM jobs WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob.rows[0],
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
    const result = await db.query('DELETE FROM jobs WHERE id = ?', [id]);

    if (result.rows.affectedRows === 0) {
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
