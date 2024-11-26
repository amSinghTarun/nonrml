export const dataURLtoFile = (dataURL: string, filename: string) : File => {
    // Split the Data URL to get the mime type and the base64 data
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]); // Decode base64 string
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
  
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
  
    // Create a file using the decoded data
    return new File([u8arr], filename, { type: mime });
}


export const convertFileToDataURL = (file: File) : Promise<any> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = () => {
        resolve(reader.result);
      };
  
      reader.onerror = (error) => {
        reject(error);
      };
  
      reader.readAsDataURL(file);
    });
}