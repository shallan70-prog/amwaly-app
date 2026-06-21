// Local app-lock: a PIN (always available) plus optional biometric via WebAuthn
// (a local-only gate that triggers the device fingerprint/face prompt).

const LS_PIN = 'amwaly_pin'
const LS_BIO = 'amwaly_bio_id'
const LS_LOCK_ON = 'amwaly_lock_enabled'

function rand(len) {
  const a = new Uint8Array(len)
  crypto.getRandomValues(a)
  return a
}
function bufToB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}
function b64ToBuf(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
}

export function lockEnabled() {
  return localStorage.getItem(LS_LOCK_ON) === '1'
}
export function setLockEnabled(on) {
  localStorage.setItem(LS_LOCK_ON, on ? '1' : '0')
}

export function hasPin() {
  return !!localStorage.getItem(LS_PIN)
}
export function setPin(pin) {
  localStorage.setItem(LS_PIN, String(pin))
  setLockEnabled(true)
}
export function verifyPin(pin) {
  return localStorage.getItem(LS_PIN) === String(pin)
}
export function clearLock() {
  localStorage.removeItem(LS_PIN)
  localStorage.removeItem(LS_BIO)
  setLockEnabled(false)
}

export async function biometricSupported() {
  if (!window.PublicKeyCredential) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch (e) {
    return false
  }
}

export function biometricEnabled() {
  return !!localStorage.getItem(LS_BIO)
}

export async function registerBiometric() {
  const cred = await navigator.credentials.create({
    publicKey: {
      challenge: rand(32),
      rp: { name: 'أموالى' },
      user: { id: rand(16), name: 'amwaly-user', displayName: 'أموالى' },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 }
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        userVerification: 'required'
      },
      timeout: 60000
    }
  })
  localStorage.setItem(LS_BIO, bufToB64(cred.rawId))
  setLockEnabled(true)
  return true
}

export async function verifyBiometric() {
  const id = localStorage.getItem(LS_BIO)
  if (!id) throw new Error('no_biometric')
  await navigator.credentials.get({
    publicKey: {
      challenge: rand(32),
      allowCredentials: [{ type: 'public-key', id: b64ToBuf(id) }],
      userVerification: 'required',
      timeout: 60000
    }
  })
  return true
}
