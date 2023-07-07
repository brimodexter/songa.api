import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import smtpTransport from 'nodemailer-smtp-transport';
import handlebars from 'handlebars';
import config from './config';
import logger from './logging';
import nodemailer from 'nodemailer';

import { promisify } from 'util';
import fs from 'fs';

const readFile = promisify(fs.readFile);

const prisma = new PrismaClient();

export const verifyCCA = async (agent: any) => {
  const token = await prisma.customerCareAgentToken.create({
    data: {
      userId: agent.id,
      token: crypto
        .randomBytes(Math.ceil(32 / 2))
        .toString('hex')
        .slice(0, 32),
    },
  });
  const url = `${process.env.BASE_URL}/api/users/customer_agent/verify/${agent.id}/${token.token}`;
  const data = {
    url: url,
    name: agent.first_name + ' ' + agent.last_name,
  };
  const text = `Hi ${data.name},\n" +
        "    Thanks for getting started with our [customer portal]!\n" +
        "\n" +
        "        We need a little more information to a confirm your email address.\n" +
        "\n" +
        "        Copy and paste on browser to confirm your email address:\n" +
        "${url}`;
  let html = await readFile('src/email_template/CCAVerification.html', 'utf8');
  const template = handlebars.compile(html);
  html = template(data);
  await sendEmail({
    email: agent.email,
    subject: 'Verify Email',
    text: text,
    html: html,
  });
};

export const sendResetPassword = async (agent: any) => {
  try {
    await prisma.customerCareAgentResetToken
      .delete({
        where: {
          userId: agent.id,
        },
      })
      .catch(error => {
        console.log(error);
      });
    const token = await prisma.customerCareAgentResetToken.create({
      data: {
        userId: agent.id,
        token: crypto
          .randomBytes(Math.ceil(32 / 2))
          .toString('hex')
          .slice(0, 32),
      },
    });
    const url = `${process.env.BASE_URL}/api/users/customer_agent/password-reset/${agent.id}/${token.token}`;
    const data = {
      url: url,
      name: agent.first_name + ' ' + agent.last_name,
    };
    const text = `Hi ${data.name}, 
    You recently requested to reset your password for your Songa app dashboard account.
    If you did not request a password reset, 
    please ignore this email or contact support if you have questions.
    Please paste the above URL into your web browser.
    ${url}
    2023 Songa App Dashboard. All rights reserved.`;
    let html = await readFile('src/email_template/CCAEmailReset.html', 'utf8');
    const template = handlebars.compile(html);
    html = template(data);
    await sendEmail({
      email: agent.email,
      subject: 'Password Reset',
      text: text,
      html: html,
    });
  } catch (error) {
    logger.error('Error sending reset email: ', error);
    return;
  }
};
export const sendEmail = async ({
  email,
  subject,
  text,
  html,
}: {
  email: string;
  subject: string;
  text: string;
  html: string;
}) => {
  try {
    const transporter = nodemailer.createTransport(
      smtpTransport({
        host: config.EMAIL_HOST,
        port: config.EMAIL_PORT,
        secure: false,
        auth: {
          user: config.EMAIL_USERNAME,
          pass: config.EMAIL_API,
        },
      })
    );
    const mailOptions = {
      from: config.EMAIL_SENDER,
      to: email,
      subject: subject,
      text: text,
      html: html,
    };
    transporter.sendMail(mailOptions, (error: any, info: any) => {
      if (error) logger.error(error);
      logger.info(info);
    });
    logger.info('Email sent SMTP successfully');
  } catch (error) {
    logger.error('Error sending confirmation email to CCA: ', error);
  }
};
