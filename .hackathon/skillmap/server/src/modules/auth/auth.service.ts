import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { PrismaClient } from '@prisma/client';
import { env } from '../../config/env';
import HttpError from '../../helpers/HttpError';
import emailService from '../email/email.service';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const prisma = new PrismaClient();

const generateToken = (id: number, role: string): string => {
  return jwt.sign({ id, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as string | number,
  } as jwt.SignOptions);
};

const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (data: {
  email: string;
  password: string;
  fullName: string;
  grade?: number;
  interests?: number[];
}) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new HttpError(409, 'Пользователь с таким email уже существует');
  }

  const code = generateCode();
  const passwordHash = await bcrypt.hash(data.password, 10);

  // Delete any previous verification for this email
  await prisma.emailVerification.deleteMany({ where: { email: data.email } });

  await prisma.emailVerification.create({
    data: {
      email: data.email,
      code,
      registrationData: {
        passwordHash,
        fullName: data.fullName,
        grade: data.grade || null,
        interests: data.interests || [],
      },
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  try {
    await emailService.sendVerificationCode(data.email, code);
  } catch (emailErr) {
    console.error('[EMAIL ERROR] Failed to send verification email:', emailErr);
    console.log(`[EMAIL FALLBACK] Verification code for ${data.email}: ${code}`);
  }

  return { message: 'Код подтверждения отправлен на email', email: data.email };
};

const verifyEmail = async (data: { email: string; code: string }) => {
  const verification = await prisma.emailVerification.findFirst({
    where: {
      email: data.email,
      code: data.code,
      verified: false,
      expiresAt: { gte: new Date() },
    },
  });

  if (!verification) {
    throw new HttpError(400, 'Неверный или просроченный код');
  }

  const regData = verification.registrationData as any;

  // Check again that user doesn't exist
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    throw new HttpError(409, 'Пользователь с таким email уже существует');
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash: regData.passwordHash,
      fullName: regData.fullName,
      grade: regData.grade,
      emailVerified: true,
      interests: regData.interests?.length
        ? {
            createMany: {
              data: regData.interests.map((categoryId: number) => ({ categoryId })),
            },
          }
        : undefined,
    },
    include: { interests: { include: { category: true } } },
  });

  // Mark verification as used
  await prisma.emailVerification.update({
    where: { id: verification.id },
    data: { verified: true },
  });

  const token = generateToken(user.id, user.role);
  return { user: formatUser(user), token };
};

const resendCode = async (email: string) => {
  const verification = await prisma.emailVerification.findFirst({
    where: { email, verified: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!verification) {
    throw new HttpError(404, 'Запрос на регистрацию не найден');
  }

  const code = generateCode();

  await prisma.emailVerification.update({
    where: { id: verification.id },
    data: {
      code,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  });

  try {
    await emailService.sendVerificationCode(email, code);
  } catch (emailErr) {
    console.error('[EMAIL ERROR] Failed to resend verification email:', emailErr);
    console.log(`[EMAIL FALLBACK] Verification code for ${email}: ${code}`);
  }
  return { message: 'Код отправлен повторно' };
};

const login = async (data: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
    include: { interests: { include: { category: true } } },
  });

  if (!user || !user.passwordHash) {
    throw new HttpError(401, 'Неверный email или пароль');
  }

  const isValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isValid) {
    throw new HttpError(401, 'Неверный email или пароль');
  }

  const token = generateToken(user.id, user.role);
  return { user: formatUser(user), token };
};

const googleAuth = async (data: { credential: string }) => {
  const ticket = await googleClient.verifyIdToken({
    idToken: data.credential,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new HttpError(401, 'Невалидный Google токен');
  }

  const googleId = payload.sub;
  const email = payload.email;
  const fullName = payload.name || email;

  let user = await prisma.user.findUnique({
    where: { googleId },
    include: { interests: { include: { category: true } } },
  });

  if (!user) {
    user = await prisma.user.findUnique({
      where: { email },
      include: { interests: { include: { category: true } } },
    });

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, emailVerified: true },
        include: { interests: { include: { category: true } } },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          fullName,
          emailVerified: true,
        },
        include: { interests: { include: { category: true } } },
      });
    }
  }

  const token = generateToken(user.id, user.role);
  return { user: formatUser(user), token };
};

const getMe = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { interests: { include: { category: true } } },
  });

  if (!user) {
    throw new HttpError(404, 'Пользователь не найден');
  }

  return formatUser(user);
};

const formatUser = (user: any) => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
  grade: user.grade,
  role: user.role,
  telegramId: user.telegramId,
  telegramUsername: user.telegramUsername,
  telegramPhotoUrl: user.telegramPhotoUrl,
  emailVerified: user.emailVerified,
  interests: user.interests?.map((i: any) => ({
    id: i.category.id,
    name: i.category.name,
  })) || [],
  createdAt: user.createdAt,
});

const forgotPassword = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: 'Если аккаунт существует, ссылка отправлена' };
  }

  const token = crypto.randomUUID();
  await prisma.passwordReset.deleteMany({ where: { email } });
  await prisma.passwordReset.create({
    data: {
      email,
      token,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    },
  });

  try {
    await emailService.sendPasswordReset(email, token);
  } catch (emailErr) {
    console.error('[EMAIL ERROR] Failed to send password reset email:', emailErr);
  }

  return { message: 'Если аккаунт существует, ссылка отправлена' };
};

const resetPassword = async (data: { token: string; password: string }) => {
  const record = await prisma.passwordReset.findUnique({
    where: { token: data.token },
  });

  if (!record || record.used || record.expiresAt < new Date()) {
    throw new HttpError(400, 'Ссылка недействительна или просрочена');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  await prisma.user.update({
    where: { email: record.email },
    data: { passwordHash },
  });
  await prisma.passwordReset.update({
    where: { id: record.id },
    data: { used: true },
  });

  return { message: 'Пароль успешно изменён' };
};

export default { register, verifyEmail, resendCode, login, googleAuth, getMe, forgotPassword, resetPassword };
