export function userDoc(uid: string) {
  return `users/${uid}`;
}

export function appointmentsCol(uid: string) {
  return `users/${uid}/appointments`;
}

export function appointmentDoc(uid: string, id: string) {
  return `users/${uid}/appointments/${id}`;
}

export function clientsCol(uid: string) {
  return `users/${uid}/clients`;
}

export function clientDoc(uid: string, id: string) {
  return `users/${uid}/clients/${id}`;
}

export function notificationsCol(uid: string) {
  return `users/${uid}/notifications`;
}

export function fcmTokensCol(uid: string) {
  return `users/${uid}/fcmTokens`;
}
