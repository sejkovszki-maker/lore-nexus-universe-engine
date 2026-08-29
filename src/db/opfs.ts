// OPFS (Origin Private File System) Wrapper
// Saves and retrieves large article texts directly to/from the local file system sandbox.

export class OPFSManager {
  private root: FileSystemDirectoryHandle | null = null;
  private isReady: boolean = false;

  async init() {
    if (this.isReady) return;
    try {
      this.root = await navigator.storage.getDirectory();
      const articlesDir = await this.root.getDirectoryHandle('articles', { create: true });
      this.isReady = true;
      console.log('OPFS Initialized');
    } catch (err) {
      console.error('OPFS nem támogatott vagy hiba történt:', err);
    }
  }

  async saveArticle(id: string, content: string) {
    if (!this.isReady || !this.root) await this.init();
    if (!this.root) return;

    try {
      const articlesDir = await this.root.getDirectoryHandle('articles', { create: true });
      const fileHandle = await articlesDir.getFileHandle(`${id}.md`, { create: true });
      
      // @ts-ignore - createWritable is supported in modern browsers
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      console.log(`Cikk mentve OPFS-be: ${id}.md`);
    } catch (err) {
      console.error(`Hiba a cikk írásakor (${id}):`, err);
    }
  }

  async readArticle(id: string): Promise<string | null> {
    if (!this.isReady || !this.root) await this.init();
    if (!this.root) return null;

    try {
      const articlesDir = await this.root.getDirectoryHandle('articles', { create: false });
      const fileHandle = await articlesDir.getFileHandle(`${id}.md`, { create: false });
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (err) {
      // File nem található
      return null;
    }
  }
}

export const opfsDB = new OPFSManager();
