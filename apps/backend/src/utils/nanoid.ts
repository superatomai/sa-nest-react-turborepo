let nanoidModule: any;

export async function getNanoid(): Promise<(size?: number) => string> {
  if (!nanoidModule) {
    nanoidModule = await import('nanoid');
  }
  return nanoidModule.nanoid;
}

export function createId(size: number = 6): string {
  // Use a simple fallback for synchronous calls
  // This generates a random string similar to nanoid
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < size; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}