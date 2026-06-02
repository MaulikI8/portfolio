import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { type, to, subject, body } = await request.json()

    if (!type || !to) {
      return NextResponse.json(
        { error: 'type and to are required' },
        { status: 400 }
      )
    }

    const results: { email?: boolean; sms?: boolean; errors?: string[] } = { errors: [] }

    // ============================
    // EMAIL NOTIFICATION
    // ============================
    if (type === 'email' || type === 'both') {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })

        await transporter.sendMail({
          from: `"Maulik's Goal Tracker" <${process.env.SMTP_USER}>`,
          to: to,
          subject: subject || '🎯 Daily Goal Update — Maulik\'s 52-Day Sprint',
          html: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #10b981; font-size: 28px; margin: 0;">🎯 Goal Tracker</h1>
                <p style="color: #94a3b8; font-size: 14px;">Maulik's 52-Day Sprint to Hireability</p>
              </div>
              <div style="background: #1e293b; padding: 24px; border-radius: 8px; border-left: 4px solid #10b981;">
                ${body || '<p>No content provided.</p>'}
              </div>
              <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155;">
                <p style="color: #64748b; font-size: 12px;">
                  Sent from <a href="https://maulikjoshi.dev/goals" style="color: #10b981;">maulikjoshi.dev/goals</a>
                </p>
              </div>
            </div>
          `,
        })

        results.email = true
      } catch (emailError) {
        console.error('❌ Email send failed:', emailError)
        results.email = false
        results.errors?.push(`Email failed: ${emailError instanceof Error ? emailError.message : 'Unknown error'}`)
      }
    }

    // ============================
    // SMS NOTIFICATION (Twilio)
    // ============================
    if (type === 'sms' || type === 'both') {
      try {
        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER

        if (!accountSid || !authToken || !twilioPhone) {
          throw new Error('Twilio credentials not configured')
        }

        const twilio = require('twilio')
        const client = twilio(accountSid, authToken)

        // Strip HTML from body for SMS
        const smsBody = (body || 'Goal update from maulikjoshi.dev')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .substring(0, 1500) // Twilio SMS limit

        await client.messages.create({
          body: `🎯 Maulik's Goal Tracker\n\n${smsBody}`,
          from: twilioPhone,
          to: to,
        })

        results.sms = true
      } catch (smsError) {
        console.error('❌ SMS send failed:', smsError)
        results.sms = false
        results.errors?.push(`SMS failed: ${smsError instanceof Error ? smsError.message : 'Unknown error'}`)
      }
    }

    const anySuccess = results.email || results.sms
    return NextResponse.json(
      {
        success: anySuccess,
        message: anySuccess
          ? 'Notification sent successfully!'
          : 'All notification channels failed.',
        details: results,
      },
      { status: anySuccess ? 200 : 500 }
    )
  } catch (error) {
    console.error('❌ Notify API error:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
