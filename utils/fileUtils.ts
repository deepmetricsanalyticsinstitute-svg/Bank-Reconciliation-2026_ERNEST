export const fileToGenerativePart = (file: File): Promise<{ mimeType: string, data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the data url prefix, e.g., 'data:application/pdf;base64,'
      const base64 = result.split(',')[1];
      resolve({
        mimeType: file.type || 'application/octet-stream', // Provide a fallback
        data: base64
      });
    };
    reader.onerror = (error) => reject(error);
  });
};
