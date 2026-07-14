import axios from 'axios';
import { Buffer } from 'buffer';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Connects to Stability AI's Stable Image Core V2 API to generate an image based on the prompt text and options.
 * 
 * @param {string} promptText - The prompt description for the image to generate.
 * @param {object} options - Generation configurations (aspectRatio, negativePrompt, style).
 * @returns {Promise<string>} A promise that resolves to a Base64-encoded JPEG image string.
 */
export async function generateAIImage(promptText, options = {}) {
  const { aspectRatio = '1:1', negativePrompt = '', style = '' } = options;

  try {
    const formData = new FormData();

    // Append style to the prompt if provided
    let finalPrompt = promptText;
    if (style && style.toLowerCase() !== 'none' && style.toLowerCase() !== 'photographic') {
      finalPrompt = `${promptText}, ${style} style`;
    } else if (style.toLowerCase() === 'photographic') {
      finalPrompt = `${promptText}, photorealistic, highly detailed, 8k resolution`;
    }

    formData.append('prompt', finalPrompt);
    formData.append('output_format', 'jpeg');

    // Ensure aspect ratio is valid in Stability Core API
    // Supported: "1:1", "16:9", "21:9", "2:3", "3:2", "4:5", "5:4", "9:16", "9:21"
    let apiAspectRatio = aspectRatio;
    if (aspectRatio === '4:3') {
      apiAspectRatio = '4:5'; // Map 4:3 to closest valid option 4:5
    }
    formData.append('aspect_ratio', apiAspectRatio);

    let cleanedNegativePrompt = '';
    if (negativePrompt && negativePrompt.trim()) {
      let cleanText = negativePrompt.toLowerCase();
      const negationPatterns = [
        /don't\s+include/gi,
        /do\s+not\s+include/gi,
        /don't\s+show/gi,
        /do\s+not\s+show/gi,
        /don't\s+add/gi,
        /do\s+not\s+add/gi,
        /exclude/gi,
        /without/gi,
        /remove/gi,
        /\bno\b/gi,
        /\bnot\b/gi,
        /shamil\s+na\s+kro/gi,
        /na\s+include\s+kro/gi,
        /nahi\s+hona\s+chahiye/gi,
        /na\s+ho/gi,
        /nahi\s+chahiye/gi,
        /mat\s+dikhana/gi
      ];

      negationPatterns.forEach(pattern => {
        cleanText = cleanText.replace(pattern, '');
      });

      // Keep alphanumeric characters, spaces, and commas
      cleanText = cleanText.replace(/[^a-zA-Z0-9,\s]/g, '');
      cleanText = cleanText.replace(/\s+/g, ' ');
      cleanText = cleanText.replace(/\s*,\s*/g, ', ');
      cleanText = cleanText.trim().replace(/^,|,$/g, '').trim();
      cleanedNegativePrompt = cleanText;
    }

    let endpoint = 'ultra';
    if (cleanedNegativePrompt) {
      formData.append('negative_prompt', cleanedNegativePrompt);
      formData.append('model', 'sd3.5-large');
      formData.append('cfg_scale', '7'); // Control strict adherence to negation
      endpoint = 'sd3';
      console.log(`[AI Image] Negative prompt present: "${cleanedNegativePrompt}". Using SD3.5 Large model on SD3 endpoint with cfg_scale: 7`);
    }

    console.log(`[AI Image] Prompt: "${finalPrompt}", Aspect Ratio: "${apiAspectRatio}", Endpoint: "${endpoint}"`);

    const apiKey = process.env.EXPO_PUBLIC_STABILITY_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: EXPO_PUBLIC_STABILITY_API_KEY is undefined. Please restart your Expo server with cache clear ('npx expo start -c') so it loads the new .env file.");
    }
    const response = await axios.post(
      `https://api.stability.ai/v2beta/stable-image/generate/${endpoint}`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'image/*',
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'arraybuffer',
      }
    );

    const base64String = Buffer.from(response.data).toString('base64');
    return `data:image/jpeg;base64,${base64String}`;
  } catch (error) {
    console.error('Error generating AI image with Stability API:', error);
    throw error;
  }
}

/**
 * High-Fidelity Image Face Swap via Magic Hour API.
 * Maps user's face perfectly onto predefined character layouts.
 * @param {string} sourceFaceUrl - Public cloud/temp URL of the user's uploaded face image.
 * @param {string} targetTemplateUrl - Public URL of our static character body template image.
 * @returns {Promise<string>} Output render result image asset URL.
 */
export async function generateImageToImage(sourceFaceUrl, targetTemplateUrl) {
  try {
    const apiKey = process.env.EXPO_PUBLIC_MAGIC_HOUR_API_KEY;
    if (!apiKey) {
      throw new Error("EXPO_PUBLIC_MAGIC_HOUR_API_KEY is not defined in your .env configuration.");
    }

    let finalTargetUrl = targetTemplateUrl;
    
    // Check if targetTemplateUrl lacks a valid file extension in its path.
    // If so, download it to local cache and upload to Uguu.se to guarantee a valid extension.
    const isRemote = targetTemplateUrl.startsWith('http');
    const hasValidExt = /\.(png|jpg|jpeg|jfif|heic|heif|webp|avif|jp2|tiff|bmp)($|\?)/i.test(targetTemplateUrl);
    
    if (isRemote && !hasValidExt) {
      console.log("[Magic Hour Engine] Target URL has no valid extension. Downloading and proxying via Uguu...");
      try {
        const tempUri = `${FileSystem.documentDirectory}temp_template_${Date.now()}.jpg`;
        console.log("[Magic Hour Engine] Downloading template to:", tempUri);
        const downloadResult = await FileSystem.downloadAsync(targetTemplateUrl, tempUri);
        console.log("[Magic Hour Engine] Download completed. Uploading template to Uguu...");
        finalTargetUrl = await uploadImageToTempCloud(downloadResult.uri);
        console.log("[Magic Hour Engine] Template uploaded successfully. Proxied URL:", finalTargetUrl);
      } catch (dlErr) {
        console.error("[Magic Hour Engine] Template proxy failed critical error:", dlErr);
      }
    }

    console.log("[Magic Hour Engine] Launching face swap synthesis job...");

    const response = await axios.post(
      'https://api.magichour.ai/v1/face-swap-photo',
      {
        name: "Remix Face Swap",
        assets: {
          face_swap_mode: "all-faces",
          source_file_path: sourceFaceUrl,
          target_file_path: finalTargetUrl
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    if (response.data && response.data.id) {
      const projectId = response.data.id;
      console.log(`[Magic Hour Engine] Swap job queued successfully. Job ID: ${projectId}. Polling for completion...`);

      const pollUrl = `https://api.magichour.ai/v1/image-projects/${projectId}`;
      let attempts = 0;
      const maxAttempts = 30; // Wait up to 60 seconds

      while (attempts < maxAttempts) {
        attempts++;
        // Wait 2 seconds before checking status again
        await new Promise(resolve => setTimeout(resolve, 2000));

        const pollResponse = await axios.get(pollUrl, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          }
        });

        const job = pollResponse.data;
        console.log(`[Magic Hour Engine] Polling attempt ${attempts}/${maxAttempts}. Status: ${job.status}`);

        if (job.status === 'complete') {
          if (job.downloads && job.downloads[0] && job.downloads[0].url) {
            console.log("[Magic Hour Engine] Swap processed successfully!", job.downloads[0].url);
            return job.downloads[0].url;
          }
          throw new Error("Job completed but no download URL was found.");
        } else if (job.status === 'error' || job.status === 'failed') {
          throw new Error(job.error || "Job failed during generation.");
        }
      }

      throw new Error("Generation timed out. Please try again.");
    } else {
      throw new Error("Invalid or empty response schema caught from Magic Hour gateway.");
    }
  } catch (error) {
    console.error("[Magic Hour Engine] Execution pipeline failed:", error.response?.data || error.message);
    throw error;
  }
}

/**
 * Uploads a local image file to a public temp cloud host (litterbox.catbox.moe).
 * @param {string} localUri - Local file URI of the image.
 * @returns {Promise<string>} Public URL of the uploaded image.
 */
export async function uploadImageToTempCloud(localUri) {
  try {
    console.log("[Temp Cloud Upload] Uploading local image to temporary cloud storage...");
    
    let targetUri = localUri;
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        localUri,
        [{ resize: { width: 800 } }], // 800px is perfect for fast upload and excellent face swap detail
        { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
      );
      targetUri = manipResult.uri;
    } catch (e) {
      console.warn("[Temp Cloud Upload] Manipulation failed, uploading original:", e);
    }

    const formData = new FormData();
    const filename = targetUri.split('/').pop() || 'face.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('files[]', {
      uri: targetUri,
      name: filename,
      type: type,
    });

    const response = await fetch('https://uguu.se/upload?output=text', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status code ${response.status}`);
    }

    const publicUrl = await response.text();
    if (publicUrl && publicUrl.trim().startsWith('http')) {
      console.log("[Temp Cloud Upload] Uploaded successfully! Public URL:", publicUrl.trim());
      return publicUrl.trim();
    } else {
      throw new Error("Failed to get public URL from Uguu response.");
    }
  } catch (error) {
    console.error("[Temp Cloud Upload] Failed to upload image:", error);
    throw error;
  }
}

