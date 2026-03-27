import nodemailer from 'nodemailer';
import { env } from '../../config/env';

let transporter: nodemailer.Transporter | null = null;
let etherealUser: string | null = null;

const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (transporter) return transporter;

  if (env.SMTP_USER) {
    const t = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
    });
    try {
      await t.verify();
      transporter = t;
      etherealUser = null; // сбросить если раньше был fallback
      console.log('[EMAIL] Using configured SMTP:', env.SMTP_HOST);
      return transporter;
    } catch (err) {
      console.warn('[EMAIL] Configured SMTP unavailable, falling back to Ethereal:', (err as Error).message);
    }
  }

  // Fallback: Ethereal test account (не кешируем — при следующем запросе снова попробуем Gmail)
  const testAccount = await nodemailer.createTestAccount();
  etherealUser = testAccount.user;
  const etherealTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log('[EMAIL] Using Ethereal test account:', testAccount.user);
  return etherealTransporter;
};

const sendMail = async (to: string, subject: string, html: string) => {
  const t = await getTransporter();
  const info = await t.sendMail({
    from: `"SkillMap" <${etherealUser ?? env.SMTP_FROM}>`,
    to,
    subject,
    html,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log(`[EMAIL PREVIEW] To: ${to} | Subject: ${subject}`);
    console.log(`[EMAIL PREVIEW] Open: ${preview}`);
  }
};

const sendVerificationCode = async (email: string, code: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #4F46E5;">SkillMap — Подтверждение email</h2>
      <p>Ваш код подтверждения:</p>
      <div style="background: #F3F4F6; border-radius: 8px; padding: 16px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1F2937;">
        ${code}
      </div>
      <p style="color: #6B7280; font-size: 14px; margin-top: 16px;">Код действителен 15 минут. Если вы не запрашивали регистрацию, проигнорируйте это письмо.</p>
    </div>
  `;
  await sendMail(email, 'Код подтверждения — SkillMap', html);
};

const sendRegistrationConfirmation = async (
  email: string,
  eventTitle: string,
  confirmToken: string,
  registrationLink?: string | null
) => {
  const confirmUrl = `${env.CLIENT_URL}/confirm-registration/${confirmToken}`;
  const regLinkBlock = registrationLink
    ? `<p style="margin-top: 16px; font-size: 14px;">Ссылка на мероприятие: <a href="${registrationLink}" style="color: #4F46E5;">${registrationLink}</a></p>`
    : '';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #4F46E5;">SkillMap — Подтверждение участия</h2>
      <p>Вы записались на мероприятие <strong>${eventTitle}</strong>.</p>
      <p>Для подтверждения участия нажмите кнопку:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${confirmUrl}" style="background: #4F46E5; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Подтвердить участие
        </a>
      </div>
      ${regLinkBlock}
    </div>
  `;
  await sendMail(email, `Подтверждение участия: ${eventTitle}`, html);
};

const sendEventRatingNotification = async (
  email: string,
  eventTitle: string,
  ratingLink: string
) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #4F46E5;">SkillMap — Оцените мероприятие</h2>
      <p>Мероприятие <strong>${eventTitle}</strong> завершилось.</p>
      <p>Поделитесь своим мнением — оцените его:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${ratingLink}" style="background: #4F46E5; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Оценить мероприятие
        </a>
      </div>
      <p style="color: #6B7280; font-size: 14px;">Или перейдите по ссылке: <a href="${ratingLink}">${ratingLink}</a></p>
    </div>
  `;
  await sendMail(email, `Оцените мероприятие: ${eventTitle}`, html);
};

const sendPasswordReset = async (email: string, token: string) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password/${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #4F46E5;">SkillMap — Сброс пароля</h2>
      <p>Для сброса пароля нажмите кнопку:</p>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Сбросить пароль
        </a>
      </div>
      <p style="color: #6B7280; font-size: 14px;">Ссылка действительна 30 минут.</p>
      <p style="color: #6B7280; font-size: 14px;">Или перейдите по ссылке: <a href="${resetUrl}">${resetUrl}</a></p>
      <p style="color: #6B7280; font-size: 14px;">Если вы не запрашивали сброс пароля, проигнорируйте это письмо.</p>
    </div>
  `;
  await sendMail(email, 'SkillMap — Сброс пароля', html);
};

export default { sendMail, sendVerificationCode, sendRegistrationConfirmation, sendEventRatingNotification, sendPasswordReset };
