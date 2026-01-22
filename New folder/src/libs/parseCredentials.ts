import { AccountCredentials } from "@/types/account";

export function parseCredentials(text: string): Partial<AccountCredentials> {
  const result: Partial<AccountCredentials> = {};
  
  // Email: pattern
  const emailMatch = text.match(/Email:\s*([^\s\n]+)/i);
  if (emailMatch) {
    result.email = emailMatch[1].trim();
  }
  
  // Microsoft Password: pattern (can be text or actual password)
  const msPasswordMatch = text.match(/Microsoft Password:\s*(.+?)(?=\n|Email Login:|$)/is);
  if (msPasswordMatch) {
    result.microsoftPassword = msPasswordMatch[1].trim();
  }
  
  // Email Login: pattern
  const emailLoginMatch = text.match(/Email Login:\s*([^\s\n]+)/i);
  if (emailLoginMatch) {
    result.emailLogin = emailLoginMatch[1].trim();
  }
  
  // Email Password: pattern
  const emailPasswordMatch = text.match(/Email Password:\s*([^\s\n]+)/i);
  if (emailPasswordMatch) {
    result.emailPassword = emailPasswordMatch[1].trim();
  }
  
  // Email Website: pattern
  const emailWebsiteMatch = text.match(/Email Website:\s*([^\s\n]+)/i);
  if (emailWebsiteMatch) {
    result.emailWebsite = emailWebsiteMatch[1].trim();
  }
  
  return result;
}
