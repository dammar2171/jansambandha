import { fmtWhen } from './projects';

// Map a backend notification (GET /notifications) to the shape the UI expects.
export function mapNotification(n) {
  return {
    id: n._id,
    text: n.message,
    when: fmtWhen(n.createdAt),
    href: n.link || '/citizen/notifications',
    read: !!n.isRead,
  };
}
