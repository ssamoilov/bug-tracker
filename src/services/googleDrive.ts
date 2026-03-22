import { Task, User } from '../types';

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private token: string | null = null;
  private readonly FOLDER_NAME = 'BugTracker';
  private readonly FILE_NAME = 'bugtracker-data.json';
  private folderId: string | null = null;

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('google-drive-token', token);
  }

  getToken(): string | null {
    if (this.token) return this.token;
    const saved = localStorage.getItem('google-drive-token');
    if (saved) this.token = saved;
    return this.token;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  clearToken() {
    this.token = null;
    this.folderId = null;
    localStorage.removeItem('google-drive-token');
  }

  private async getOrCreateFolder(): Promise<string | null> {
    if (this.folderId) return this.folderId;

    try {
      const token = this.getToken();
      if (!token) throw new Error('Not authenticated');

      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const searchData = await searchResponse.json();
      
      if (searchData.files && searchData.files.length > 0) {
        this.folderId = searchData.files[0].id;
        return this.folderId;
      }

      const createResponse = await fetch(
        'https://www.googleapis.com/drive/v3/files',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: this.FOLDER_NAME,
            mimeType: 'application/vnd.google-apps.folder',
          }),
        }
      );

      const createData = await createResponse.json();
      this.folderId = createData.id;
      return this.folderId;
    } catch (error) {
      console.error('Error getting/creating folder:', error);
      return null;
    }
  }

  async saveData(tasks: Task[], users: User[]): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    try {
      const folderId = await this.getOrCreateFolder();
      if (!folderId) throw new Error('Could not create folder');
      
      const data = {
        version: '1.0',
        lastSync: new Date().toISOString(),
        tasks,
        users,
      };

      const jsonString = JSON.stringify(data, null, 2);
      
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${this.FILE_NAME}' and '${folderId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const searchData = await searchResponse.json();
      const existingFile = searchData.files?.[0];

      if (existingFile) {
        await fetch(
          `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
          {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: jsonString,
          }
        );
      } else {
        const metadata = {
          name: this.FILE_NAME,
          parents: [folderId],
          mimeType: 'application/json',
        };

        const formData = new FormData();
        formData.append(
          'metadata',
          new Blob([JSON.stringify(metadata)], { type: 'application/json' })
        );
        formData.append('file', new Blob([jsonString], { type: 'application/json' }));

        await fetch(
          'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
      }

      console.log('Data saved to Google Drive');
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      throw error;
    }
  }

  async loadData(): Promise<{ tasks: Task[]; users: User[] } | null> {
    const token = this.getToken();
    if (!token) throw new Error('Not authenticated');

    try {
      const folderId = await this.getOrCreateFolder();
      if (!folderId) return null;
      
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${this.FILE_NAME}' and '${folderId}' in parents and trashed=false`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const searchData = await searchResponse.json();
      const file = searchData.files?.[0];

      if (!file) {
        return null;
      }

      const fileResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await fileResponse.json();
      return {
        tasks: data.tasks || [],
        users: data.users || [],
      };
    } catch (error) {
      console.error('Error loading from Google Drive:', error);
      return null;
    }
  }

  async getSyncInfo(): Promise<{ lastSync: string | null; fileId: string | null }> {
    const token = this.getToken();
    if (!token) return { lastSync: null, fileId: null };

    try {
      const folderId = await this.getOrCreateFolder();
      if (!folderId) return { lastSync: null, fileId: null };
      
      const searchResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='${this.FILE_NAME}' and '${folderId}' in parents and trashed=false&fields=files(id,modifiedTime)`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const searchData = await searchResponse.json();
      const file = searchData.files?.[0];

      if (file) {
        return {
          lastSync: file.modifiedTime,
          fileId: file.id,
        };
      }

      return { lastSync: null, fileId: null };
    } catch (error) {
      console.error('Error getting sync info:', error);
      return { lastSync: null, fileId: null };
    }
  }
}

export const googleDrive = GoogleDriveService.getInstance();