import Fastify, { FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import jwt, { SignOptions } from 'jsonwebtoken';

import { config, requireStrongSecret } from '@eloktantra/config';
import { UserRole } from '@eloktantra/types';
import {
  badRequest,
  conflict,
  corsOriginFromList,
  forbidden,
  readBearerToken,
  registerDefaultErrorHandler,
  registerGracefulShutdown,
  registerSecurityHeaders,
  unauthorized,
} from '@eloktantra/utils';

import supabasePlugin from './plugins/supabase';

dotenv.config();

const SERVICE_NAME = 'auth-service';
const PORT = config.services.auth.port;
const JWT_SECRET = config.isProduction
  ? requireStrongSecret('JWT_SECRET', 32)
  : process.env.JWT_SECRET || 'dev-only-jwt-secret-change-me';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '12h') as SignOptions['expiresIn'];

const allowedRoles = new Set<string>(Object.values(UserRole));

const fastify = Fastify({
  logger: { level: config.logLevel },
  requestTimeout: config.requestTimeoutMs,
  trustProxy: true,
});

registerSecurityHeaders(fastify, config.isProduction);
registerDefaultErrorHandler(fastify, SERVICE_NAME);
registerGracefulShutdown(fastify, SERVICE_NAME, config.shutdownTimeoutMs);

fastify.register(cors, {
  origin: corsOriginFromList(config.corsOrigins),
  credentials: true,
});

fastify.register(supabasePlugin);

fastify.get('/health', async () => {
  return {
    success: true,
    status: 'ok',
    service: SERVICE_NAME,
    timestamp: new Date().toISOString(),
  };
});

fastify.post('/auth/register', {
  schema: {
    body: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { type: 'string', minLength: 2, maxLength: 120 },
        email: { type: 'string', format: 'email', maxLength: 180 },
        password: { type: 'string', minLength: 10, maxLength: 128 },
        role: { type: 'string', enum: ['CITIZEN', 'ADMIN', 'CANDIDATE'] },
        constituency: { type: 'string', minLength: 2, maxLength: 80 },
      },
    },
  },
}, async (request, reply) => {
  const { name, email, password, role, constituency } = request.body as {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    constituency?: string;
  };

  const normalizedEmail = email.trim().toLowerCase();
  const selectedRole = role || UserRole.CITIZEN;

  if (!allowedRoles.has(selectedRole)) {
    throw badRequest('Invalid role value');
  }

  const { data: existingUser, error: lookupError } = await fastify.supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (lookupError) {
    throw badRequest(lookupError.message);
  }

  if (existingUser) {
    throw conflict('User with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const { data, error } = await fastify.supabase
    .from('users')
    .insert([
      {
        name,
        email: normalizedEmail,
        role: selectedRole,
        constituency: constituency || null,
        password_hash: passwordHash,
        is_verified: true,
        status: 'ACTIVE',
      },
    ])
    .select('id, name, email, role, constituency, is_verified, status, created_at')
    .single();

  if (error || !data) {
    throw badRequest(error?.message || 'Unable to register user');
  }

  return reply.code(201).send({
    success: true,
    user: data,
  });
});

fastify.post('/auth/login', {
  schema: {
    body: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', maxLength: 180 },
        password: { type: 'string', minLength: 10, maxLength: 128 },
      },
    },
  },
}, async (request) => {
  const { email, password } = request.body as { email: string; password: string };
  const normalizedEmail = email.trim().toLowerCase();

  const { data: user, error } = await fastify.supabase
    .from('users')
    .select('id, name, email, role, constituency, password_hash, is_verified, status')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    throw badRequest(error.message);
  }

  if (!user) {
    throw unauthorized('Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw unauthorized('Invalid email or password');
  }

  if (!user.is_verified) {
    throw forbidden('User verification is pending');
  }

  if (user.status !== 'ACTIVE') {
    throw forbidden('User account is inactive');
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      constituency: user.constituency,
    },
  };
});

const authenticate = async (request: FastifyRequest) => {
  const token = readBearerToken(request);
  if (!token) {
    throw unauthorized('Missing bearer token');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      email: string;
      role: UserRole;
    };

    return decoded;
  } catch {
    throw unauthorized('Invalid or expired token');
  }
};

fastify.get('/auth/me', async (request) => {
  const decoded = await authenticate(request);

  const { data: user, error } = await fastify.supabase
    .from('users')
    .select('id, name, email, role, constituency, is_verified, status')
    .eq('id', decoded.sub)
    .maybeSingle();

  if (error) {
    throw badRequest(error.message);
  }

  if (!user) {
    throw unauthorized('User no longer exists');
  }

  return {
    success: true,
    user,
  };
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT, host: config.host });
    fastify.log.info(`Auth Service running on http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

void start();
