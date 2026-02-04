-- Enable leaked password protection for better security
-- This prevents users from using passwords that have been compromised in data breaches
ALTER DATABASE postgres SET app.settings.auth_password_validators_enable_leaked_password_protection = 'on';