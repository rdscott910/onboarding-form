import crypto from 'crypto';

interface StoredData {
  data: string;
  expiry: number;
}

class ServerStore {
  private store: Map<string, StoredData> = new Map();
  private readonly algorithm = 'aes-256-cbc';
  private readonly key: Buffer;
  private readonly iv: Buffer;

  constructor() {
    // In a production environment, these should be set as environment variables
    this.key = crypto.scryptSync(process.env.ENCRYPTION_KEY || 'your-secret-key', 'salt', 32);
    this.iv = crypto.randomBytes(16);
  }

  set(id: string, newData: any, expiryInSeconds: number = 300): void {
    const expiryTime = Date.now() + expiryInSeconds * 1000;
    const existingEntry = this.store.get(id);
    let mergedData: any;

    if (existingEntry) {
      // Decrypt the existing data
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
      const decrypted = Buffer.concat([decipher.update(Buffer.from(existingEntry.data, 'hex')), decipher.final()]);
      const existingData = JSON.parse(decrypted.toString('utf8'));

      // Merge the existing data with the new data
      mergedData = { ...existingData, ...newData };
    } else {
      mergedData = newData;
    }

    // Encrypt the merged data
    const jsonData = JSON.stringify(mergedData);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    const encrypted = Buffer.concat([cipher.update(jsonData, 'utf8'), cipher.final()]);

    // Store the updated data
    this.store.set(id, {
      data: encrypted.toString('hex'),
      expiry: expiryTime,
    });
  }

  get(id: string): any | null {
    const storedData = this.store.get(id);
    if (!storedData) return null;

    if (Date.now() > storedData.expiry) {
      this.store.delete(id);
      return null;
    }

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    const decrypted = Buffer.concat([decipher.update(Buffer.from(storedData.data, 'hex')), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8'));
  }

  delete(id: string): void {
    this.store.delete(id);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [id, data] of this.store.entries()) {
      if (now > data.expiry) {
        this.store.delete(id);
      }
    }
  }
}

// Create a singleton instance
const serverStore = new ServerStore();

// Run cleanup every 5 minutes
setInterval(() => serverStore.cleanup(), 5 * 60 * 1000);

export default serverStore;
