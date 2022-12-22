
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

export const formatStableDiffusionConfigForReplicate = (config: any) => {
  const c = JSON.parse(JSON.stringify(config));
  if (c.translation) {
    c['translation_x'] = c['translation'][0];
    c['translation_y'] = c['translation'][1];
    c['translation_z'] = c['translation'][2];
    c['rotation_x'] = c['rotation'][0];
    c['rotation_y'] = c['rotation'][1];
    c['rotation_z'] = c['rotation'][2];
    c['interpolation_texts'] = c['interpolation_texts'].join("|")
    c['interpolation_seeds'] = c['interpolation_seeds'].join("|")
    c['interpolation_init_images'] = c['interpolation_init_images'].join("|")
    c['init_image_file'] = c['init_image_file'] || null;
    c['mask_image_file'] = c['mask_image_file'] || null;
    c['init_video'] = c['mask_image_file'] || null;
    delete c['translation'];
    delete c['rotation'];
    if (!c['init_image_file']) {
      delete c['init_image_file'];
    }
    if (!c['mask_image_file']) {
      delete c['mask_image_file'];
    }
    if (!c['init_video']) {
      delete c['init_video'];
    }
  }
  return c;
}