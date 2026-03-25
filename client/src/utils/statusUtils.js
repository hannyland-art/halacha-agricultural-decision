/**
 * Status code to Hebrew label and badge class mapping
 */
export const STATUS_MAP = {
  PERMITTED: {
    label: 'מותר',
    badgeClass: 'badge-success',
    icon: '✅',
  },
  ORLAH_ACTIVE: {
    label: 'ערלה חלה',
    badgeClass: 'badge-danger',
    icon: '🚫',
  },
  ORLAH_ACTIVE_ESTIMATED: {
    label: 'ערלה חלה (תאריך משוער)',
    badgeClass: 'badge-danger',
    icon: '🚫',
  },
  ORLAH_RESTART: {
    label: 'מניין מחדש',
    badgeClass: 'badge-danger',
    icon: '🔄',
  },
  ORLAH_CONTINUES: {
    label: 'מניין ממשיך',
    badgeClass: 'badge-warning',
    icon: '⏳',
  },
  EXEMPT: {
    label: 'ייתכן פטור',
    badgeClass: 'badge-success',
    icon: '✔️',
  },
  POSSIBLY_EXEMPT: {
    label: 'ייתכן פטור',
    badgeClass: 'badge-info',
    icon: 'ℹ️',
  },
  DOUBT: {
    label: 'ספק',
    badgeClass: 'badge-warning',
    icon: '❓',
  },
  NEEDS_REVIEW: {
    label: 'דורש בירור',
    badgeClass: 'badge-warning',
    icon: '⚠️',
  },
  NOT_APPLICABLE: {
    label: 'לא רלוונטי',
    badgeClass: 'badge-info',
    icon: 'ℹ️',
  },
  IN_PROGRESS: {
    label: 'בטיפול',
    badgeClass: 'badge-info',
    icon: '🔄',
  },
  INCOMPLETE: {
    label: 'לא הושלם',
    badgeClass: 'badge-muted',
    icon: '📝',
  },
};

export function getStatusInfo(statusCode) {
  return STATUS_MAP[statusCode] || {
    label: statusCode || 'לא ידוע',
    badgeClass: 'badge-muted',
    icon: '❓',
  };
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
