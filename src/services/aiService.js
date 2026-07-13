import axios from 'axios';
import { Buffer } from 'buffer';
import * as ImageManipulator from 'expo-image-manipulator';

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
 * Dynamic AI Remix Engine (Handles both Style Transfer and Character Costume Swaps)
 * @param {string} imageUri - Local URI of the source image.
 * @param {string} targetPrompt - What to generate (Style or Costume).
 * @param {string} modelType - Either 'style' or 'character'
 * @param {number} strength - Conditioning strength (Only used for style transfer).
 */
export async function generateImageToImage(imageUri, targetPrompt, modelType = 'style', strength = 0.38) {
  try {
    // Automatically downscale the image if it exceeds the maximum dimension to prevent Stability AI's pixel limit error
    let targetImageUri = imageUri;
    try {
      console.log(`[Remix Engine] Optimizing and resizing image before upload to avoid Stability API dimension limits...`);
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1200 } }], // Safely scales width to 1200 and preserves aspect ratio
        { compress: 0.95, format: ImageManipulator.SaveFormat.JPEG }
      );
      targetImageUri = manipResult.uri;
      console.log(`[Remix Engine] Image successfully optimized and scaled down: ${targetImageUri}`);
    } catch (manipError) {
      console.warn(`[Remix Engine] ImageManipulator failed, uploading original image. Error:`, manipError);
    }

    const filename = targetImageUri.split('/').pop() || 'input_image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    const formData = new FormData();
    formData.append('image', {
      uri: targetImageUri,
      name: filename,
      type: type,
    });
    
    formData.append('output_format', 'jpeg');

    let apiEndpoint = '';

    // CONDITIONAL ROUTING BASED ON MODEL TYPE
    if (modelType === 'character') {
      // Character Transformation via Search and Replace (Preserves face completely)
      apiEndpoint = 'https://api.stability.ai/v2beta/stable-image/edit/search-and-replace';
      formData.append('prompt', targetPrompt);
      formData.append('search_prompt', 'clothing, clothes, shirt, jacket, suit, dress, background');
      console.log(`[Remix Engine] Routing to Search-and-Replace Endpoint for Character Cosplay.`);
    } else {
      // Pure Style Transfer via standard Image-to-Image (SD3)
      apiEndpoint = 'https://api.stability.ai/v2beta/stable-image/generate/sd3';
      formData.append('prompt', targetPrompt);
      formData.append('strength', String(strength));
      formData.append('mode', 'image-to-image');
      formData.append('model', 'sd3.5-large');
      console.log(`[Remix Engine] Routing to standard Image-to-Image Endpoint for Stylization.`);
    }

    const apiKey = process.env.EXPO_PUBLIC_STABILITY_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: EXPO_PUBLIC_STABILITY_API_KEY is undefined. Please restart your Expo server with cache clear ('npx expo start -c') so it loads the new .env file.");
    }

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'image/*',
        // Note: Content-Type header MUST be omitted to let the environment inject boundary automatically
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Stability API Error (${response.status}): ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString('base64');
    return `data:image/jpeg;base64,${base64String}`;
  } catch (error) {
    console.error('Error in Dynamic Image Transformation:', error);
    throw error;
  }
}

