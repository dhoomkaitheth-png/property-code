const { query } = require('../config/database');

// Get published blogs
const getBlogs = async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const conditions = ['is_published = true'];
    const params = [];
    let paramIndex = 1;

    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      params.push(category);
    }

    const whereClause = 'WHERE ' + conditions.join(' AND ');
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await query(`SELECT COUNT(*) FROM blogs ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT id, title, slug, excerpt, featured_image, author, category, tags, 
              view_count, published_at, created_at
       FROM blogs ${whereClause}
       ORDER BY published_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: result.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch blogs' });
  }
};

// Get single blog by slug
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await query(
      `SELECT * FROM blogs WHERE slug = $1 AND is_published = true`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }

    // Increment view count
    await query('UPDATE blogs SET view_count = view_count + 1 WHERE id = $1', [result.rows[0].id]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Get blog error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch blog' });
  }
};

// Get blog categories
const getBlogCategories = async (req, res) => {
  try {
    const result = await query(
      `SELECT category, COUNT(*)::int as count 
       FROM blogs WHERE is_published = true 
       GROUP BY category ORDER BY count DESC`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get blog categories error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
};

// Get featured blogs
const getFeaturedBlogs = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, slug, excerpt, featured_image, author, category, published_at
       FROM blogs WHERE is_published = true AND is_featured = true
       ORDER BY published_at DESC LIMIT 5`
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Get featured blogs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch featured blogs' });
  }
};

// Admin: Create blog
const createBlog = async (req, res) => {
  try {
    const { title, slug, content, excerpt, featured_image, category, tags, is_published } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ success: false, error: 'Title, slug and content are required' });
    }

    const result = await query(
      `INSERT INTO blogs (title, slug, content, excerpt, featured_image, author, category, tags, is_published, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CASE WHEN $9 THEN CURRENT_TIMESTAMP ELSE NULL END)
       RETURNING *`,
      [title, slug, content, excerpt || null, featured_image || null, 
       req.user?.username || 'Admin', category || 'general', 
       tags || [], is_published || false]
    );

    res.status(201).json({ success: true, message: 'Blog created', data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'Slug already exists' });
    }
    console.error('Create blog error:', error);
    res.status(500).json({ success: false, error: 'Failed to create blog' });
  }
};

// Admin: Update blog
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const setClauses = [];
    const params = [id];
    let paramIndex = 2;

    const allowedFields = ['title', 'slug', 'content', 'excerpt', 'featured_image', 
                          'category', 'tags', 'is_published', 'is_featured'];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'tags') {
          setClauses.push(`${key} = $${paramIndex++}::text[]`);
          params.push(value);
        } else {
          setClauses.push(`${key} = $${paramIndex++}`);
          params.push(value);
        }
      }
    }

    if (updates.is_published === true) {
      setClauses.push(`published_at = COALESCE(published_at, CURRENT_TIMESTAMP)`);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ success: false, error: 'No valid fields to update' });
    }

    const result = await query(
      `UPDATE blogs SET ${setClauses.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }

    res.json({ success: true, message: 'Blog updated', data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'Slug already exists' });
    }
    console.error('Update blog error:', error);
    res.status(500).json({ success: false, error: 'Failed to update blog' });
  }
};

// Admin: Delete blog
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM blogs WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Blog not found' });
    }

    res.json({ success: true, message: 'Blog deleted' });
  } catch (error) {
    console.error('Delete blog error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete blog' });
  }
};

// Admin: Get all blogs (including drafts)
const getAllBlogsAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const countResult = await query('SELECT COUNT(*) FROM blogs');
    const total = parseInt(countResult.rows[0].count);

    const result = await query(
      `SELECT * FROM blogs ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: result.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Get all blogs admin error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch blogs' });
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  getBlogCategories,
  getFeaturedBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogsAdmin
};