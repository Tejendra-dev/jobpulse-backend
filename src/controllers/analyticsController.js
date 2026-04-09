const pool = require('../config/db');

// GET /api/analytics/summary
const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // Total counts by status
    const statusCounts = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM jobs WHERE user_id = $1
       GROUP BY status`,
      [userId]
    );

    // Platform-wise breakdown
    const platformStats = await pool.query(
      `SELECT platform,
              COUNT(*) as total,
              COUNT(*) FILTER (WHERE status = 'interview') as interviews,
              COUNT(*) FILTER (WHERE status = 'offer') as offers,
              COUNT(*) FILTER (WHERE status = 'ghost') as ghosts,
              COUNT(*) FILTER (WHERE status = 'rejected') as rejections
       FROM jobs WHERE user_id = $1
       GROUP BY platform
       ORDER BY total DESC`,
      [userId]
    );

    // Monthly application trend (last 6 months)
    const monthlyTrend = await pool.query(
      `SELECT TO_CHAR(applied_date, 'Mon YYYY') as month,
              DATE_TRUNC('month', applied_date) as month_date,
              COUNT(*) as total
       FROM jobs
       WHERE user_id = $1
         AND applied_date >= NOW() - INTERVAL '6 months'
       GROUP BY month, month_date
       ORDER BY month_date ASC`,
      [userId]
    );

    // Jobs about to go ghost (applied, between 10-15 days old)
    const aboutToGhost = await pool.query(
      `SELECT id, company, role, platform, applied_date,
              EXTRACT(DAY FROM NOW() - applied_date::timestamp) as days_since_applied
       FROM jobs
       WHERE user_id = $1
         AND status = 'applied'
         AND applied_date <= NOW() - INTERVAL '10 days'
         AND applied_date > NOW() - INTERVAL '15 days'
       ORDER BY applied_date ASC`,
      [userId]
    );

    // Build status map
    const statusMap = { applied: 0, interview: 0, offer: 0, rejected: 0, ghost: 0 };
    statusCounts.rows.forEach((r) => {
      statusMap[r.status] = parseInt(r.count);
    });

    const total = Object.values(statusMap).reduce((a, b) => a + b, 0);
    const ghostRate = total > 0 ? ((statusMap.ghost / total) * 100).toFixed(1) : 0;
    const responseRate =
      total > 0
        ? (((statusMap.interview + statusMap.offer + statusMap.rejected) / total) * 100).toFixed(1)
        : 0;

    res.json({
      summary: {
        total,
        ...statusMap,
        ghostRate: parseFloat(ghostRate),
        responseRate: parseFloat(responseRate),
      },
      platformStats: platformStats.rows,
      monthlyTrend: monthlyTrend.rows,
      aboutToGhost: aboutToGhost.rows,
    });
  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
};

module.exports = { getSummary };
