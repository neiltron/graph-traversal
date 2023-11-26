import { client } from "@gradio/client";

const app = await client("https://neiltron-controlnet-sdxl-canny.hf.space", {
  hf_token: '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',
});

export const generate = async (inputImage: Blob) => {
  return await app.predict(0, [
    // false, // boolean  in 'Use a custom pre-trained LoRa model ? (optional)' Checkbox component
    // "null", // string  in 'Your custom model ID' Textbox component
    // "null", // string (Option from: []) in 'Safetensors file' Dropdown component
    // 0.9, // number (numeric value between 0.1 and 0.9) in 'Custom model weights' Slider component
    inputImage, 	// blob in 'parameter_19' Image component
    "aerial images, orthographic, terrain, grassy, mountains, roads", // string  in 'Prompt' Textbox component
    // "isometric, diagonal view, side view, extra digit, fewer digits, cropped, worst quality, low quality, glitch, deformed, mutated, ugly, disfigured", // string  in 'Negative prompt' Textbox component
    // "canny", // string (Option from: [('canny', 'canny')]) in 'Preprocessor' Dropdown component
    // .5, // number (numeric value between 0.1 and 0.9) in 'Controlnet conditioning Scale' Slider component
    // 7.5, // number (numeric value between 1.0 and 10.0) in 'Guidance Scale' Slider component
    // 25, // number (numeric value between 25 and 50) in 'Inference Steps' Slider component
    // -1, // number (numeric value between -1 and 423538377342) in 'Seed' Slider component
  ]);
};