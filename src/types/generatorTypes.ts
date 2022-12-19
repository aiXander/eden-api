export type GeneratorType = "stable-diffusion" | "clipx" | "oracle" | "dreambooth";

export type GeneratorConfig = StableDiffusionConfig | ClipXConfig | OracleConfig;

export interface ClipXConfig {
  model_name: string;
  clip_model_options: [string[]];
  width: number;
  height: number;
  num_octaves: number;
  octave_scale: number;
  num_iterations: number[];
}

export const ClipXDefaults: ClipXConfig = {
  model_name: "imagenet",
  clip_model_options: [["ViT-B/32", "ViT-B/16", "RN50"]],
  width: 1280,
  height: 720,
  num_octaves: 3,
  octave_scale: 2.0,
  num_iterations: [300, 400, 500],
};

export interface OracleConfig {
  question: string;
  face: string;
  voice_embedding: string;
  length_scale: number;
  inference_noise_scale: number;
  inference_noise_scale_dp: number;
  language_id: number;
  use_griffin_lim: boolean;
}

export const OracleDefaults: OracleConfig = {
  question: "",
  face: "data/oracle.jpg",
  voice_embedding: "data/rivka_embedding.pkl",
  length_scale: 1.4,
  inference_noise_scale: 0.3,
  inference_noise_scale_dp: 0.3,
  language_id: 0,
  use_griffin_lim: true,
};

export interface StableDiffusionConfig {
  precision: string;
  half_precision: boolean;
  mode: string;
  stream: boolean;
  stream_every: number;
  width: number;
  height: number;
  sampler: string;
  steps: number;
  scale: number;
  ddim_eta: number;
  C: number;
  f: number;
  upscale_f: number;
  dynamic_threshold: string;
  static_threshold: string;
  init_image: string;
  init_image_data: string;
  init_image_strength: number;
  init_image_inpaint_mode: string;
  init_sample: string;
  init_latent: string;
  mask_image: string;
  mask_image_file: string;
  mask_image_data: string;
  mask_invert: boolean;
  mask_brightness_adjust: number;
  mask_contrast_adjust: number;
  text_input: string;
  uc_text: string;
  seed: number;
  n_samples: number;
  interpolation_texts: string[];
  interpolation_seeds: number[];
  interpolation_init_images: string[];
  interpolation_init_images_use_img2txt: boolean;
  interpolation_init_images_top_k: number;
  interpolation_init_images_power: number;
  interpolation_init_images_min_strength: number;
  interpolation_init_images_max_strength: number;
  n_frames: number;
  scale_modulation: number;
  loop: boolean;
  smooth: boolean;
  n_film: number;
  fps: number;
  animation_mode: string;
  color_coherence: string;
  init_video: string;
  extract_nth_frame: number;
  turbo_steps: number;
  previous_frame_strength: number;
  previous_frame_noise: number;
  contrast: number;
  angle: number;
  zoom: number;
  translation: number[];
  rotation: number[];
}

export const StableDiffusionDefaults: StableDiffusionConfig = {
  precision: "autocast",
  half_precision: true,
  mode: "generate",
  stream: false,
  stream_every: 1,
  width: 512,
  height: 512,
  sampler: "klms",
  steps: 50,
  scale: 8.0,
  ddim_eta: 0.0,
  C: 4,
  f: 8,
  upscale_f: 1.0,
  dynamic_threshold: "",
  static_threshold: "",
  init_image: "",
  init_image_data: "",
  init_image_strength: 0.0,
  init_image_inpaint_mode: "cv2_telea",
  init_sample: "",
  init_latent: "",
  mask_image: "",
  mask_image_file: "",
  mask_image_data: "",
  mask_invert: false,
  mask_brightness_adjust: 1.0,
  mask_contrast_adjust: 1.0,
  text_input: "hello world",
  uc_text: "",
  seed: 13,
  n_samples: 1,
  interpolation_texts: [],
  interpolation_seeds: [],
  interpolation_init_images: [],
  interpolation_init_images_use_img2txt: false,
  interpolation_init_images_top_k: 2,
  interpolation_init_images_power: 3.0,
  interpolation_init_images_min_strength: 0.2,
  interpolation_init_images_max_strength: 0.95,
  n_frames: 1,
  scale_modulation: 0.2,
  loop: false,
  smooth: false,
  n_film: 0,
  fps: 12,
  animation_mode: "2D",
  color_coherence: "Match Frame 0 LAB",
  init_video: "",
  extract_nth_frame: 1,
  turbo_steps: 3,
  previous_frame_strength: 0.65,
  previous_frame_noise: 0.02,
  contrast: 1.0,
  angle: 0,
  zoom: 1.0,
  translation: [0, 0, 0],
  rotation: [0, 0, 0],
};
