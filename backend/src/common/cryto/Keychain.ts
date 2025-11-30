import { webcrypto } from "crypto";

const { subtle, getRandomValues } = webcrypto;

const PBKDF2_ITERATIONS = 100_000;
const MAX_PASSWORD_LENGTH = 64;
const SALT_LEN = 16;
const IV_LEN = 12;
const AUTH_ENTRY_NAME = "__auth_entry__";
const AUTH_PLAINTEXT = "keychain-auth-v1";

export class Keychain {
  private data: { salt: string; kvs: Record<string, any> };
  private secrets: { hmacKeyBytes: Uint8Array; aesKeyBytes: Uint8Array };
  private _hmacCryptoKey: CryptoKey | null = null;
  private _aesCryptoKey: CryptoKey | null = null;

  constructor(saltBytes: Uint8Array, hmacKeyBytes: Uint8Array, aesKeyBytes: Uint8Array, kvs: Record<string, any> = {}) {
    this.data = { salt: Buffer.from(saltBytes).toString("base64"), kvs: { ...kvs } };
    this.secrets = { hmacKeyBytes, aesKeyBytes };
  }

  private async _importHmacKey() {
    if (!this._hmacCryptoKey) {
      this._hmacCryptoKey = await subtle.importKey("raw", this.secrets.hmacKeyBytes, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    }
    return this._hmacCryptoKey;
  }

  private async _importAesKey() {
    if (!this._aesCryptoKey) {
      this._aesCryptoKey = await subtle.importKey("raw", this.secrets.aesKeyBytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
    }
    return this._aesCryptoKey;
  }

  private static _strToBuf(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  private static _bufToStr(buf: Uint8Array): string {
    return new TextDecoder().decode(buf);
  }

  private static _b64Encode(buf: Uint8Array): string {
    return Buffer.from(buf).toString("base64");
  }

  private static _b64Decode(b64: string): Uint8Array {
    return new Uint8Array(Buffer.from(b64, "base64"));
  }

  static async init(password: string): Promise<Keychain> {
    const salt = getRandomValues(new Uint8Array(SALT_LEN));
    const passKey = await subtle.importKey("raw", Keychain._strToBuf(password), "PBKDF2", false, ["deriveBits"]);
    const derivedBits = await subtle.deriveBits({ name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" }, passKey, 256);
    const master = new Uint8Array(derivedBits);
    const masterHmac = await subtle.importKey("raw", master, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);

    const hmacKeyBytes = new Uint8Array(await subtle.sign("HMAC", masterHmac, Keychain._strToBuf("hmac-key"))).slice(0, 32);
    const aesKeyBytes = new Uint8Array(await subtle.sign("HMAC", masterHmac, Keychain._strToBuf("aes-key"))).slice(0, 32);

    const kc = new Keychain(salt, hmacKeyBytes, aesKeyBytes);
    const authKey = await kc._computeKey(AUTH_ENTRY_NAME);
    const authData = Keychain._strToBuf(AUTH_PLAINTEXT);
    const enc = await kc._encrypt(authData, authKey);
    kc.data.kvs[authKey] = enc;
    return kc;
  }

  private async _computeKey(name: string): Promise<string> {
    const key = await this._importHmacKey();
    const mac = await subtle.sign("HMAC", key, Keychain._strToBuf(name));
    return Keychain._b64Encode(new Uint8Array(mac));
  }

  private async _encrypt(plain: Uint8Array, aadB64: string) {
    const aes = await this._importAesKey();
    const iv = getRandomValues(new Uint8Array(IV_LEN));
    const aad = Keychain._b64Decode(aadB64);
    const ct = await subtle.encrypt({ name: "AES-GCM", iv, additionalData: aad, tagLength: 128 }, aes, plain);
    return { iv: Keychain._b64Encode(iv), ct: Keychain._b64Encode(new Uint8Array(ct)) };
  }

  private async _decrypt(ivB64: string, ctB64: string, aadB64: string) {
    const aes = await this._importAesKey();
    const iv = Keychain._b64Decode(ivB64);
    const ct = Keychain._b64Decode(ctB64);
    const aad = Keychain._b64Decode(aadB64);
    const plain = await subtle.decrypt({ name: "AES-GCM", iv, additionalData: aad, tagLength: 128 }, aes, ct);
    return new Uint8Array(plain);
  }

  async set(name: string, value: string) {
    const key = await this._computeKey(name);
    const enc = await this._encrypt(Keychain._strToBuf(value), key);
    this.data.kvs[key] = enc;
  }

  async get(name: string): Promise<string | null> {
    const key = await this._computeKey(name);
    const entry = this.data.kvs[key];
    if (!entry) return null;
    const plain = await this._decrypt(entry.iv, entry.ct, key);
    return Keychain._bufToStr(plain);
  }

  async dump() {
    return JSON.stringify(this.data);
  }
}
