import axios from 'axios';
import { Buffer } from 'buffer';

/**
 * Connects to Stability AI's Stable Image Core V2 API to generate an image based on the prompt text.
 * 
 * @param {string} promptText - The prompt description for the image to generate.
 * @returns {Promise<string>} A promise that resolves to a Base64-encoded JPEG image string.
 */
export async function generateAIImage(promptText) {
  try {
    const formData = new FormData();
    formData.append('prompt', promptText);
    formData.append('output_format', 'jpeg');
    formData.append('aspect_ratio', '1:1');

    const response = await axios.post(
      'https://api.stability.ai/v2beta/stable-image/generate/core',
      formData,
      {
        headers: {
          'Authorization': 'sk-yvUC9JGlQ0HW9J3189xuX7jtIa0DxgPSagdt3WkvJB8iBJHB',
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
