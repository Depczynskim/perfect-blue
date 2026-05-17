export function messagingRequiresSubscription(): boolean {
  const value = process.env.MESSAGING_REQUIRES_SUBSCRIPTION;
  if (value === undefined || value === '') return false;
  return value === 'true' || value === '1';
}
