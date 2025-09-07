// Configuration file for the digital nomad platform
module.exports = {
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_fzBCE2NK8ydi@ep-floral-fog-a1bvk2px-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    ssl: {
      rejectUnauthorized: false
    }
  },

  // Application configuration
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-this-in-production'
  },

  // Rate limiting
  rateLimit: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutes
    maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || 100
  }
};
