import pkg from "pg";
const { Pool } = pkg;
import "dotenv/config";

// Usar URL de conexão sem SSL para desenvolvimento local
let poolConfig;

if (process.env.POSTGRES_HOST === "localhost") {
  // Conexão local (Docker)
  poolConfig = {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    ssl: false,
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  };
} else {
  // Conexão remota (Neon/Vercel)
  poolConfig = {
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
  };
}

const pool = new Pool(poolConfig);

// Tratamento de erros de conexão
pool.on("error", (err) => {
  // Ignorar erros de terminação do banco de dados durante testes
  if (err.code === 'XX000' && err.message?.includes('db_termination')) {
    return;
  }
  console.error("Unexpected error on idle client", err);
});

// Testar conexão ao inicializar
pool.query("SELECT NOW()", (err, result) => {
  if (err) {
    console.error("❌ PostgreSQL Connection Error:", err.message);
    console.error("Environment variables:");
    console.error("  HOST:", process.env.POSTGRES_HOST);
    console.error("  USER:", process.env.POSTGRES_USER);
    console.error("  DATABASE:", process.env.POSTGRES_DATABASE);
    console.error("  PORT:", process.env.DATABASE_PORT);
  } else {
    console.log("✅ PostgreSQL Connected Successfully!");
    console.log("   Database:", process.env.POSTGRES_DATABASE);
    console.log("   Host:", process.env.POSTGRES_HOST);
    console.log("   User:", process.env.POSTGRES_USER);
  }
});

export default pool;
