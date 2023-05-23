import * as crypto from "crypto";
import {CustomerCareAgent, PrismaClient} from "@prisma/client";
const nodemailer = require('nodemailer');
import smtpTransport from "nodemailer-smtp-transport";
import handlebars from "handlebars";
import config from "./config";
import logger from "./logging";

const {promisify} = require('util');
const fs = require('fs');

const readFile = promisify(fs.readFile);

const prisma = new PrismaClient()

export const verifyCCA = async (agent: any) => {
    let token = await prisma.customerCareAgentToken.create({
        data:
            {
                userId: agent.id,
                token: crypto.randomBytes(Math.ceil(32 / 2)).toString('hex').slice(0, 32)
            },
    });
    const url = `${process.env.BASE_URL}/api/users/customer_agent/verify/${agent.id}/${token.token}`;
    let data = {
        url: url,
        name: agent.first_name + ' ' + agent.last_name
    }
    const text = `Hi ${data.name},\n" +
        "    Thanks for getting started with our [customer portal]!\n" +
        "\n" +
        "        We need a little more information to a confirm your email address.\n" +
        "\n" +
        "        Copy and paste on browser to confirm your email address:\n" +
        "${url}`
    let html = await readFile('src/email_template/CCAVerification.html', 'utf8');
    let template = handlebars.compile(html);
    html = template(data);
    await sendEmail({email: agent.email, subject: "Verify Email", text: text, html: html});
};

export const sendEmail = async ({email, subject, text, html}: {
    email: string,
    subject: string,
    text: string,
    html: string,
}) => {
    try {
        const transporter = nodemailer.createTransport(smtpTransport({
            host: config.EMAIL_HOST,
            port: config.EMAIL_PORT,
            secure: false,
            auth: {
                user: config.EMAIL_USERNAME,
                pass: config.EMAIL_API,
            },
        }));
        let mailOptions = {
            from: config.EMAIL_SENDER,
            to: email,
            subject: subject,
            text: text,
            html: html
        };
        transporter.sendMail(mailOptions, (error: any, info: any) => {
            if (error) logger.error(error);
            logger.info(info)
        });
        logger.info("Email sent SMTP successfully");
    } catch (error) {
        logger.error("Error sending confirmation email to CCA: ", error)
    }
};
