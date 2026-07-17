/** Format price from fen (cents) to yuan display string */
export function formatPrice(fen: number): string {
  return (fen / 100).toFixed(2);
}

/** Format relative time */
export function formatTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`;

  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Mask phone number: 138****1234 */
export function maskPhone(phone: string): string {
  if (phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}

/** Format views count */
export function formatViews(views: number): string {
  if (views < 1000) return String(views);
  if (views < 10000) return (views / 1000).toFixed(1) + 'k';
  return (views / 10000).toFixed(1) + 'w';
}
