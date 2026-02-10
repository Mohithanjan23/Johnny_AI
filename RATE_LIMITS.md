# Supabase Rate Limits & Configuration

You requested to increase the login/signin limits. This **cannot be done via code** and must be configured in your Supabase dashboard.

## 1. Increasing Rate Limits
1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project (`johnny-ai` or similar).
3.  Navigate to **Authentication** -> **Rate Limits** (in the sidebar).
4.  Look for **Email OTP** or **Magic Link** limits.
5.  Increase the value (e.g., from 30/hour to 100/hour or whatever your plan allows).

## 2. Removing the "3 Emails Per Hour" Limit
By default, Supabase uses its own email service which is strictly limited to prevent spam.
- **Limit**: ~3-4 emails per hour.
- **Solution**: You **must** configure your own SMTP provider to send unlimited (or higher volume) emails.
    1.  Go to **Authentication** -> **Providers** -> **Email**.
    2.  Toggle "Enable Custom SMTP".
    3.  Enter details for a provider like **Resend**, **SendGrid**, or **AWS SES**.
        - *Recommendation*: **Resend** is very easy to set up and has a generous free tier.

## 3. Persistent Login
We have enabled `persistSession: true` in the code.
- Users will stay logged in until they explicitly click the "Sign Out" button.
- Closing the tab or browser will **not** log them out.
