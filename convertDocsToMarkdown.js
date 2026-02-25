// 1. Open Google Apps Script Editor: Go to https://script.google.com/home and create a new project
// 2. Paste the Code: Replace the default Code.gs content with the following script
// 3. Save the project, give it a name: gDocsToMarkdownConverter
// 4. Get Folder IDs: Note down the folder IDs of your source and destination folders from their respective Google Drive URLs
//        A folder ID is the alphanumeric string after https://drive.google.com/drive/folders/
// 5. Enable the Drive API: In your Google Apps Script project, go to Services on the left sidebar, scroll down to find Drive API, and click Add
// 6. Select the downloadAllDocsAsMarkdown function from the dropdown menu and click Run (play icon)
// 7. The first time you run it, you will be prompted to review permissions
//        Click Review permissions, select your Google account, and click Allow. Or you may see a link to your app name under Advanced

function convertFolderDocsToMarkdown() {
  // --- USER CONFIGURATION ---
  const srcFolderId = "YOUR_SOURCE_FOLDER_ID"; // Replace with your source folder ID
  const dstFolderId = "YOUR_DESTINATION_FOLDER_ID"; // Replace with your destination folder ID
  // --------------------------

  const dstFolder = DriveApp.getFolderById(dstFolderId);
  const files = DriveApp.getFolderById(srcFolderId).getFilesByType(MimeType.GOOGLE_DOCS);
  const token = ScriptApp.getOAuthToken();

  while (files.hasNext()) {
    const doc = files.next();
    const documentId = doc.getId();
    const docName = doc.getName();
    
    // URL for the Drive API Export endpoint
    const url = "https://www.googleapis.com/drive/v3/files/" + documentId + "/export?mimeType=text/markdown";

    const res = UrlFetchApp.fetch(url, {
      headers: {
        Authorization: "Bearer " + ScriptApp.getOAuthToken()
      },
      muteHttpExceptions: true
    });

    if (res.getResponseCode() === 200) {
      let markdownContent = res.getContentText();

      // Identify lines starting with one or more #, followed by spaces, ending the line.
      // The 'gm' flags mean "global" (all instances) and "multiline" (treat each line separately).
      const cleanMarkdown = markdownContent
        .replace(/^#+[ \t]*$/gm, "")    // Remove empty headers
        .replace(/\n{3,}/g, "\n\n");    // Collapse 3+ newlines into just 2

      // Save the cleaned content
      dstFolder.createFile(docName + ".md", cleanMarkdown);
      console.log("Converted and cleaned: " + docName);
    } else {
      console.error("Failed: " + docName);
    }
  }
  Logger.log("All Google Docs converted to Markdown format and saved in the destination folder.");
}
