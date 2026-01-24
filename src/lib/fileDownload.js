/**
 * Utility function to download a file from blob response
 * @param {Blob} blob - The blob data from API response
 * @param {string} filename - The filename for the downloaded file
 */
export function downloadFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
