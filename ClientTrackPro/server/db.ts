import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "../shared/schema"

// Initialize the PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Create a Drizzle instance
export const db = drizzle(pool, { schema })

// Export the pool for direct queries if needed
export { pool }

// Function to test the database connection
export async function testConnection() {
  try {
    const client = await pool.connect()
    const result = await client.query("SELECT NOW()")
    client.release()
    console.log("Database connection successful:", result.rows[0])
    return true
  } catch (error) {
    console.error("Database connection error:", error)
    return false
  }
}

// Function to close the database connection pool
export async function closePool() {
  try {
    await pool.end()
    console.log("Database connection pool closed")
  } catch (error) {
    console.error("Error closing database connection pool:", error)
  }
}
