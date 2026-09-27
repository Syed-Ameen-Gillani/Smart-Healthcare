"""Small SMTP email service used by account and contact flows."""

import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587


def _get_credentials():
    from config.settings import SMTP_EMAIL, SMTP_FROM_NAME, SMTP_PASSWORD
    return SMTP_EMAIL, SMTP_PASSWORD, SMTP_FROM_NAME


def _smtp_send(sender: str, password: str, recipient: str, message: MIMEMultipart):
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(sender, password)
        server.sendmail(sender, recipient, message.as_string())


async def send_email(to_email: str, subject: str, body: str, html: bool = True):
    sender, password, from_name = _get_credentials()
    if not sender or not password:
        logger.warning("SMTP credentials are not configured; email skipped")
        return False
    try:
        message = MIMEMultipart("alternative")
        message["From"] = f"{from_name} <{sender}>"
        message["To"] = to_email
        message["Subject"] = subject
        message.attach(MIMEText(body, "html" if html else "plain"))
        await asyncio.get_running_loop().run_in_executor(None, _smtp_send, sender, password, to_email, message)
        logger.info("Email sent to %s", to_email)
        return True
    except smtplib.SMTPAuthenticationError:
        logger.error("SMTP authentication failed")
    except Exception as exc:
        logger.error("Email send failed: %s", exc)
    return False


async def send_welcome_email(email: str, name: str):
    body = f"""<h2>Welcome, {name}!</h2>
    <p>Smart Health lets you upload medical reports, review Gemini-assisted findings, find a relevant demonstration specialist, chat about general health information, and place demonstration medicine orders.</p>
    <p>This academic prototype provides decision support only and is not a diagnostic or clinical service.</p>"""
    return await send_email(email, "Welcome to Smart Health", body)


async def send_contact_confirmation(email: str, name: str):
    body = f"""<h2>Hello {name},</h2><p>We received your message and will review it.</p><p>Smart Health FYP Team</p>"""
    return await send_email(email, "We received your Smart Health message", body)
