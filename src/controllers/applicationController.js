const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// POST /api/applications (Public: Candidate submits CV)
exports.submitApplication = async (req, res) => {
  try {
    const { job_id, full_name, email, phone, cover_letter } = req.body;

    if (!full_name || !email || !phone) {
      // Remove uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Full name, email, and phone number are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your CV (.pdf, .doc, or .docx)',
      });
    }

    // Verify job exists if job_id provided
    let validJobId = null;
    if (job_id) {
      const jobCheck = await db.query('SELECT id FROM jobs WHERE id = ?', [job_id]);
      if (jobCheck.rows.length > 0) {
        validJobId = jobCheck.rows[0].id;
      }
    }

    const query = `
      INSERT INTO applications 
      (job_id, full_name, email, phone, cv_file_path, original_file_name, cover_letter, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `;

    const values = [
      validJobId,
      full_name.trim(),
      email.trim(),
      phone.trim(),
      req.file.filename,
      req.file.originalname,
      cover_letter ? cover_letter.trim() : null,
    ];

    const result = await db.query(query, values);

    // Fetch the newly created application
    const newApp = await db.query(
      'SELECT id, full_name, email, phone, original_file_name, status, applied_at FROM applications WHERE id = ?',
      [result.rows.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully! Our HR team will review your profile.',
      data: newApp.rows[0],
    });
  } catch (err) {
    console.error('Error in submitApplication:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/applications (HR only: list applications with job details)
exports.getAllApplications = async (req, res) => {
  try {
    const { status, job_id } = req.query;
    let query = `
      SELECT 
        a.id, a.job_id, a.full_name, a.email, a.phone, 
        a.original_file_name, a.cover_letter, a.status, a.applied_at,
        j.title AS job_title, j.department AS job_department
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      query += ` AND a.status = ?`;
    }

    if (job_id && job_id !== 'all') {
      params.push(job_id);
      query += ` AND a.job_id = ?`;
    }

    query += ' ORDER BY a.applied_at DESC';

    const result = await db.query(query, params);
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error('Error in getAllApplications:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/applications/:id (HR only: get application details)
exports.getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        a.*, 
        j.title AS job_title, j.department AS job_department, j.location AS job_location
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      WHERE a.id = ?
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error in getApplicationById:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// GET /api/applications/:id/download-cv (HR only: download CV file securely)
exports.downloadCV = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT cv_file_path, original_file_name FROM applications WHERE id = ?',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const { cv_file_path, original_file_name } = result.rows[0];
    const filePath = path.join(__dirname, '../uploads/cvs', cv_file_path);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'CV file not found on server' });
    }

    res.download(filePath, original_file_name || 'candidate_cv.pdf');
  } catch (err) {
    console.error('Error in downloadCV:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// PATCH /api/applications/:id/status (HR only: update application status)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const result = await db.query(
      'UPDATE applications SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.rows.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    // Fetch the updated application
    const updated = await db.query('SELECT * FROM applications WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      data: updated.rows[0],
    });
  } catch (err) {
    console.error('Error in updateApplicationStatus:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// DELETE /api/applications/:id (HR only: delete application)
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    // First get the CV path before deleting
    const appData = await db.query(
      'SELECT cv_file_path FROM applications WHERE id = ?',
      [id]
    );

    if (appData.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const cvFilePath = appData.rows[0].cv_file_path;

    // Delete from database
    await db.query('DELETE FROM applications WHERE id = ?', [id]);

    // Delete CV file from disk
    const cvPath = path.join(__dirname, '../uploads/cvs', cvFilePath);
    if (fs.existsSync(cvPath)) {
      fs.unlinkSync(cvPath);
    }

    res.json({
      success: true,
      message: 'Application and CV removed successfully',
    });
  } catch (err) {
    console.error('Error in deleteApplication:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
