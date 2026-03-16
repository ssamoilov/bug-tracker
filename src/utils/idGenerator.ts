export function generateTaskId(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BUG-${year}-${random}`;
  }
  
  export function generateCommentId(): string {
    return `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  export function generateAttachmentId(): string {
    return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }