import axios from 'axios';
import { Buffer } from 'buffer';

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
 * Transforms an input image using Stability AI's V2 Image-to-Image API (SD3) based on a style prompt and strength.
 * 
 * @param {string} imageUri - The local URI of the source image.
 * @param {string} stylePrompt - The stylized prompt suffix configured from the grid selection.
 * @param {number} strength - Conditioning strength (0.0 to 1.0, default 0.55).
 * @returns {Promise<string>} A promise that resolves to a Base64-encoded JPEG image string.
 */
export async function generateImageToImage(imageUri, stylePrompt, strength = 0.55) {
  try {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: imageUri,
      name: filename,
      type: type,
    });
    formData.append('prompt', stylePrompt);
    formData.append('strength', strength.toString());
    formData.append('mode', 'image-to-image');
    formData.append('output_format', 'jpeg');

    const apiKey = process.env.EXPO_PUBLIC_STABILITY_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: EXPO_PUBLIC_STABILITY_API_KEY is undefined. Please restart your Expo server with cache clear ('npx expo start -c') so it loads the new .env file.");
    }

    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/sd3',
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
    console.error('Error in generateImageToImage with Stability API:', error);
    throw error;
  }
}

