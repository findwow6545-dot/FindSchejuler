declare namespace Cloudflare {
  interface Env {
    OWNER_EMAIL?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
