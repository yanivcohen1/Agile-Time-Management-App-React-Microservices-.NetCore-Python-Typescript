import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import dotenv from 'dotenv';

const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({ path: path.join(process.cwd(), `.env.${nodeEnv}`) });

interface Config {
  Jwt: {
    Key: string;
  };
  ConnectionStrings: {
    MongoConnection: string;
  };
  Server: {
    Urls: string;
  };
  Cors: {
    AllowedOrigins: string;
  };
}

const configPath = path.join(process.cwd(), 'appsettings.yml');
const config: Config = yaml.load(fs.readFileSync(configPath, 'utf8')) as Config;

export type UserRole = 'admin' | 'user';

export interface CredentialDefinition {
  username: string;
  password: string;
  role: UserRole;
}

const JWT_SECRET = config.Jwt.Key;

const ADMIN_USERNAME = process.env.AUTH_ADMIN_USERNAME ?? "admin@todo.dev";
const ADMIN_PASSWORD = process.env.AUTH_ADMIN_PASSWORD ?? "ChangeMe123!";

const USER_USERNAME = process.env.AUTH_USER_USERNAME ?? "user@todo.dev";
const USER_PASSWORD = process.env.AUTH_USER_PASSWORD ?? "ChangeMe123!";

const MONGO_URI = process.env.MONGO_URI ?? config.ConnectionStrings.MongoConnection;

// Helper to extract DB name from Mongo URI
const getDbNameFromUri = (uri: string) => {
  try {
    const url = new URL(uri);
    return url.pathname.split('/').pop() || undefined;
  } catch {
    return undefined;
  }
};

const MONGO_DB = process.env.MONGO_DB ?? getDbNameFromUri(MONGO_URI) ?? 'express_ts';
const MONGO_READ_ADMIN_USERNAME = process.env.MONGO_READ_ADMIN_USERNAME;
const MONGO_READ_ADMIN_PASSWORD = process.env.MONGO_READ_ADMIN_PASSWORD;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required.');
}

// Parse server URLs to get port
const serverUrls = config.Server.Urls.split(';');
const firstUrl = serverUrls[0];
const url = new URL(firstUrl);
const port = process.env.PORT ? parseInt(process.env.PORT) : (parseInt(url.port) || 3000);

const jwtTtl = process.env.JWT_ACCESS_TTL_SECONDS ? parseInt(process.env.JWT_ACCESS_TTL_SECONDS) : 3600;

const credentialMap = new Map<string, CredentialDefinition>();

function registerCredential(username: string | undefined, password: string | undefined, role: UserRole): void {
  if (!username || !password) {
    return;
  }

  credentialMap.set(username, { username, password, role });
}

registerCredential(ADMIN_USERNAME, ADMIN_PASSWORD, 'admin');
registerCredential(USER_USERNAME, USER_PASSWORD, 'user');

if (credentialMap.size === 0) {
  registerCredential('admin', 'password', 'admin');
  registerCredential('user', 'password', 'user');
}

export const env = {
  port,
  jwtSecret: JWT_SECRET,
  jwtTtl,
  credentials: Array.from(credentialMap.values()),
  mongoUri: MONGO_URI,
  mongoDb: MONGO_DB,
  mongoReadAdminUsername: MONGO_READ_ADMIN_USERNAME,
  mongoReadAdminPassword: MONGO_READ_ADMIN_PASSWORD,
  corsAllowedOrigins: config.Cors.AllowedOrigins.split(',')
};
