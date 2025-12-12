import { Pool, QueryResult } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = async (
  text: string,
  params?: any[]
): Promise<QueryResult> => {
  return pool.query(text, params);
};

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL database"))
  .catch((err) => console.error("❌ DB Connection Error:", err));



// import { Pool, QueryResult } from "pg";
// import dotenv from "dotenv";

// dotenv.config();


// console.log("ENV DB_HOST:", process.env.DB_HOST);

// const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT),
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// export const query = async (text: string, params?: any[]): Promise<QueryResult> => {
//   return pool.query(text, params);
// };

// pool.connect()
//   .then(() => console.log("✅ Connected to PostgreSQL database"))
//   .catch((err) => console.error("❌ DB Connection Error:", err));

