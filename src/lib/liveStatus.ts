/**
 * Turns raw Supabase / network errors into a plain explanation plus the next
 * step. The raw message is always kept, so nothing is hidden from operators.
 */
export type LiveProblemKind =
  | 'not-signed-in'
  | 'not-migrated'
  | 'bad-key'
  | 'unreachable'
  | 'permission'
  | 'unknown';

export interface LiveProblem {
  kind: LiveProblemKind;
  /** One short sentence a farmer or judge can read. */
  summary: string;
  /** What to do next. */
  hint: string;
}

export function describeLiveError(message: string | null | undefined): LiveProblem {
  const text = String(message || '').trim();
  const lower = text.toLowerCase();

  if (/invalid api key|invalid jwt|apikey|no api key/.test(lower)) {
    return {
      kind: 'bad-key',
      summary: 'The database key on this deployment is not accepted.',
      hint: 'Check VITE_SUPABASE_PUBLISHABLE_KEY in Vercel (use the anon / publishable key, not the service key), then redeploy.',
    };
  }
  if (/failed to fetch|networkerror|network request failed|load failed|fetch failed|enotfound|econnrefused/.test(lower)) {
    return {
      kind: 'unreachable',
      summary: 'The database could not be reached.',
      hint: 'Check VITE_SUPABASE_URL in Vercel and that the Supabase project is not paused, then redeploy.',
    };
  }
  if (/could not find the table|does not exist|schema cache|relation .* does not exist|pgrst20[0-9]|42p01|42703/.test(lower)) {
    return {
      kind: 'not-migrated',
      summary: 'The database has no NIRDHOOM tables yet, or is missing some of them.',
      hint: 'Apply the SQL migrations in order (see docs/GO-LIVE.md), then reload.',
    };
  }
  if (/permission denied|row-level security|42501|not authorized|jwt expired/.test(lower)) {
    return {
      kind: 'permission',
      summary: 'This account is not allowed to read these records.',
      hint: 'Sign in with your mobile number. If you are already signed in, the profile role may be missing.',
    };
  }
  return {
    kind: 'unknown',
    summary: 'Live records could not be loaded.',
    hint: 'Reload the page. If it keeps happening, run `npm run doctor` and check the browser console.',
  };
}

/** Auth errors from signInWithOtp / verifyOtp, in words a farmer can act on. */
export function describeAuthError(message: string | null | undefined, fallback: string): string {
  const text = String(message || '').trim();
  const lower = text.toLowerCase();
  if (!text) return fallback;
  if (/email.*rate limit|rate limit.*email|over_email_send_rate_limit/.test(lower)) {
    return 'This site has sent too many sign-in emails for now. Wait a while and try again. The site owner can lift this limit by adding a custom email (SMTP) provider in Supabase.';
  }
  if (/error sending (confirmation|magic link|recovery|otp)? ?e?-?mail|error sending.*email|smtp|sending.*email/.test(lower)) {
    return 'The site could not send the email. The site owner needs to check the email (SMTP) settings in Supabase.';
  }
  if (/email (logins?|sign-?ins?|provider)? ?(are|is) (disabled|not enabled)|email.*(disabled|not enabled)|provider is not enabled/.test(lower)) {
    return 'Email sign-in is turned off in Supabase. The site owner needs to enable the Email provider under Authentication.';
  }
  if (/unsupported phone provider|sms provider|phone provider|twilio|messagebird|vonage|textlocal/.test(lower)) {
    return 'SMS sign-in is not switched on for this site yet. The site owner needs to enable Phone sign-in and an SMS provider in Supabase.';
  }
  if (/signups? (not allowed|(are|is) disabled)|signups? not allowed for otp/.test(lower)) {
    return 'New accounts are turned off in Supabase. The site owner needs to allow new sign-ups under Authentication.';
  }
  if (/phone logins? (are|is) disabled|phone.*disabled/.test(lower)) {
    return 'Phone sign-in is turned off in Supabase. The site owner needs to enable the Phone provider.';
  }
  if (/rate limit|too many|security purposes|only request this after/.test(lower)) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  if (/token has expired|invalid.*(otp|token|code)|otp.*(expired|invalid)/.test(lower)) {
    return 'That code is wrong or has expired. Check the latest message or ask for a new code.';
  }
  if (/invalid.*email|email.*invalid|unable to validate email/.test(lower)) {
    return 'That email address does not look right. Check it and try again.';
  }
  if (/invalid.*phone|phone.*invalid|unable to validate phone/.test(lower)) {
    return 'That mobile number does not look right. Enter the 10 digits without +91.';
  }
  return text;
}
