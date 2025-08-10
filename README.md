# Katarses Image Uploader (Foundry VTT v13)
A minimal, GM-only uploader to quickly send images into your Foundry data storage using the official FilePicker API.

## Features
- Drag & drop multiple images
- Choose target folder via FilePicker
- Progress + success/failure feedback
- Optional date-based subfolder
- Adds a **camera** tool button in Scene Controls (left toolbar)
- Also available from **Game Settings → Configure Settings → Module Settings**

## Install (manual / development)
1. Download the ZIP and extract into your Foundry `Data/modules/katarses-image-uploader` folder.
2. Restart Foundry and enable the module in your world.
3. Find the **camera** button in the left toolbar or open **Settings → Module Settings → Open Uploader**.

## Permissions
- GM only. Players cannot upload files.

## Notes
- Uses `FilePicker.upload('data', target, file)` so it works with your default local data source.
- If you use S3 or other storage, change the `SOURCE` constant in `UploadApp.js` to match your setup.
