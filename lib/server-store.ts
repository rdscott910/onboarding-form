import crypto from 'crypto';
import { PartialLocationData, RestaurantHours } from '@/lib/types/types';

interface StoredData {
  data: string;
  expiry: number;
}

interface ServerStoreData extends PartialLocationData {
  restaurant_hours: RestaurantHours[];
  banking_info?: {
    routing_number: string;
    account_number: string;
  };
  expirationTime?: number;
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

    console.log('Server store initialized');
  }

  set(id: string, newData: ServerStoreData, expiryInSeconds: number = 300): void {
    try {
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

      console.log(`Data stored for ${id} with expiry time ${new Date(expiryTime).toISOString()}`);
      console.log('Stored data:', mergedData);
    } catch (error) {
      console.error('Error in server store set:', error);
    }
  }

  get(id: string): ServerStoreData | null {
    console.log(`Attempting to retrieve data for ID: ${id}`);
    try {
      const storedData = this.store.get(id);
      if (!storedData) {
        console.log('No data found for ID:', id);
        return null;
      }

      if (Date.now() > storedData.expiry) {
        console.log('Data is expired for ID:', id);
        this.store.delete(id);
        return null;
      }

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
      const decrypted = Buffer.concat([decipher.update(Buffer.from(storedData.data, 'hex')), decipher.final()]);
      const decryptedData = JSON.parse(decrypted.toString('utf8'));
      console.log(`Successfully retrieved data for ID: ${id}`);

      return decryptedData;
    } catch (error) {
      console.error('Error in server store get:', error);
      return null;
    }
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
