db = db.getSiblingDB('eden');

db.createUser({
  user: 'eden',
  pwd: 'eden',
  roles: [
    {
      role: 'readWrite',
      db: 'eden',
    },
  ],
});

db.createCollection('users');

const admin = db.users.insertMany([
 {
    userId: 'admin',
    username: 'admin',
    isWallet: false,
    isAdmin: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

db.createCollection('apikeys');

db.apikeys.insertMany([
  {
    user: admin.insertedIds[0],
    apiKey: 'admin',
    apiSecret: 'admin',
    note: 'Admin API key',
    deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]);

db.createCollection('generators');

const baseParameters = [
  {
    name: 'width',
    label: 'Width',
    description: 'Width of the creation in pixels',
    default: 768,
    minimum: 64, 
    maximum: 1280,
    step: 64,
  },
  {
    name: 'height',
    label: 'Height',
    description: 'Height of the creation in pixels',
    default: 768,
    minimum: 64, 
    maximum: 1280,
    step: 64,
  },
  {
    name: 'upscale_f',
    label: 'Upscale Factor',
    description: 'Diffusion-based upscaling factor',
    default: 1.0,
    minimum: 1.0,
    maximum: 4.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'checkpoint',
    label: 'Checkpoint',
    description: 'Which model to generate with',
    default: 'dreamlike-art/dreamlike-photoreal-2.0',
    allowedValues: [
      'runwayml/stable-diffusion-v1-5',
      'prompthero/openjourney-v2',
      'dreamlike-art/dreamlike-photoreal-2.0'
    ],
    isRequired: true,
  },
  {
    name: 'lora',
    label: 'LORA',
    description: '(optional) Use a LORA finetuning. To prompt, use the format <Name>, e.g. "A photo of <Bill>"',
    default: '(none)',
    // allowedValues: ['(none)'],
  },
  {
    name: 'lora_scale',
    label: 'LORA scale',
    description: 'How much to apply LORA finetuning',
    default: 0.8,
    minimum: 0.0,
    maximum: 1.0,
    step: 0.01,
  },
  {
    name: 'sampler',
    label: 'Sampler',
    description: 'Sampler to use for generation',
    default: 'euler',
    allowedValues: ['euler'],
    //allowedValues: ['klms', 'dpm2', 'dpm2_ancestral', 'heun', 'euler', 'euler_ancestral', 'ddim', 'plms', 'dpm'],
    optional: true,
  },
  {
    name: 'steps',
    label: 'Steps',
    description: 'Number of sampling steps',
    default: 60,
    minimum: 5, 
    maximum: 200,
    optional: true,
  },
  {
    name: 'guidance_scale',
    label: 'Guidance scale',
    description: 'Strength of of prompt conditioning guidance',
    default: 10.0,
    minimum: 0.0, 
    maximum: 20.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'stream',
    label: 'Stream',
    description: 'Yield intermediate results during creation process (if false, only final result is returned)',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'stream_every',
    label: 'Stream every',
    description: 'How often to yield intermediate results (when stream is true). In sampling steps for images, frames for video.',
    default: 1,
    minimum: 1,
    maximum: 10,
    optional: true,
  }
]

const animationParameters = [
  {
    name: 'n_frames',
    label: 'Frames',
    description: 'Number of frames in the video',
    default: 48,
    minimum: 2,
    maximum: 100,
  },
  {
    name: 'loop',
    label: 'Loop',
    description: 'Loop the output video',
    default: false,
    allowedValues: [false, true],
  },
  {
    name: 'smooth',
    label: 'Smooth',
    description: 'Optimize video for perceptual smoothness between frames (if false, frames are linearly spaced in prompt conditioning space)',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'n_film',
    label: 'FILM Iterations',
    description: 'How many iterations to apply FILM (film interpolation) to the generated frames',
    default: 0,
    allowedValues: [0, 1],
    optional: true,
  },
  {
    name: 'fps',
    label: 'FPS',
    description: 'Frames per second of the output video',
    default: 12,
    minimum: 1,
    maximum: 30,
    optional: true,
  },
  {
    name: 'scale_modulation',
    label: 'Scale Modulation',
    description: 'How much to modulate the guidance scale of the prompt conditioning between frames',
    default: 0.0,
    minimum: 0.0,
    maximum: 0.5,
    step: 0.01,
    optional: true,
  },
]

const createParameters = [
  ...baseParameters,
  {
    name: 'text_input',
    label: 'Prompt',
    description: 'Text prompt for the creation',
    default: null,
    isRequired: true,
  },
  {
    name: 'uc_text',
    label: 'Negative prompt',
    description: 'Unconditional (negative) prompt',
    default: 'nude, naked, nsfw, poorly drawn face, ugly, tiling, out of frame, extra limbs, disfigured, deformed body, blurry, blurred, watermark, text, grainy, signature, cut off, draft',
    optional: true,
  },
  {
    name: 'init_image_data',
    label: 'Init image',
    default: null,
    description: 'URL of image to initiate image before diffusion (if null, use random noise)',
    mediaUpload: true,
    optional: true,
  },
  {
    name: 'init_image_strength',
    label: 'Init image strength',
    description: 'How much to weight the initial image in the diffusion process',
    default: 0.0,
    minimum: 0.0,
    maximum: 1.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'n_samples',
    label: 'Samples',
    description: 'Number of samples to create.',
    default: 1,
    allowedValues: [1, 2, 4],
    optional: true,
  },
  {
    name: 'seed',
    label: 'Seed',
    description: 'Set random seed for reproducibility. If blank, will be set randomly.',
    default: null,
    minimum: 0,
    maximum: 1e8,
    optional: true,
  }
]

const interpolationParameters = [
  ...baseParameters,
  ...animationParameters,
  {
    name: 'interpolation_texts',
    label: 'Prompts',
    description: 'Prompts to interpolate through',
    default: [],
    minLength: 2,
    maxLength: 20,
    isRequired: true,
  },
  {
    name: 'interpolation_seeds',
    label: 'Seeds',
    description: 'Random seeds. Must have 1 for each prompt. If left blank, will be set randomly.',
    default: [],
    optional: true,
  }
]

const real2realParameters = [
  ...baseParameters,
  ...animationParameters,
  {
    name: 'interpolation_init_images',
    label: 'Real images',
    description: 'URLs of images to use as init images for real2real',
    default: [],
    mediaUpload: true,
    minLength: 2,
    maxLength: 20,
    isRequired: true,
  },
  {
    name: 'interpolation_init_images_power',
    label: 'Init image power',
    description: 'Power of the init_img_strength curve (how fast init_strength declines at endpoints)',
    default: 3.0,
    minimum: 1.0,
    maximum: 5.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'interpolation_init_images_min_strength',
    label: 'Init image min strength',
    description: 'Minimum strength of the init_img during interpolation',
    default: 0.2,
    minimum: 0.0,
    maximum: 0.5,
    step: 0.01,
    optional: true,
  },
  {
    name: 'interpolation_init_images_max_strength',
    label: 'Init image max strength',
    description: 'Maximum strength of the init_img during interpolation',
    default: 0.95,
    minimum: 0.5,
    maximum: 1.0,
    step: 0.01,
    optional: true,
  },
  {
    name: 'interpolation_seeds',
    label: 'Interpolation seeds',
    description: 'Random seeds. Must have 1 for each init image. If left blank, will be set randomly.',
    default: [],
    optional: true,
  }
]

const remixParameters = [
  ...baseParameters,
  {
    name: 'init_image_data',
    label: 'Init image',
    description: 'URL of image to initiate image before diffusion (if null, use random noise)',
    default: null,
    mediaUpload: true,
    isRequired: true,
  },
  {
    name: 'init_image_strength',
    label: 'Init image strength',
    description: 'How much to weight the initial image in the diffusion process',
    default: 0.0,
    minimum: 0.0,
    maximum: 1.0,
    step: 0.01,
  },
  {
    name: 'n_samples',
    label: 'Samples',
    description: 'Number of samples to create remix',
    default: 1,
    allowedValues: [1, 2, 4],
    optional: true,
  },
  {
    name: 'uc_text',
    label: 'Negative prompt',
    description: 'Unconditional (negative) prompt',
    default: 'nude, naked, nsfw, poorly drawn face, ugly, tiling, out of frame, extra limbs, disfigured, deformed body, blurry, blurred, watermark, text, grainy, signature, cut off, draft',
    optional: true,
  },
  {
    name: 'seed',
    label: 'Seed',
    description: 'Set random seed for reproducibility. If blank, will be set randomly.',
    default: null,
    minimum: 0,
    maximum: 1e8,
    optional: true,
  }
]

const interrogateParameters = [
  {
    name: 'init_image_data',
    label: 'Image',
    description: 'URL of image to initiate image before diffusion (if null, use random noise)',
    default: null,
    mediaUpload: true,
    isRequired: true,
  },
]

const loraParameters = [
  {
    name: 'lora_training_urls',
    label: 'Training images',
    description: 'URLs for the image files of target concept to train a LORA for',
    mediaUpload: true,
    default: [],
    minLength: 1,
    maxLength: 20,
    isRequired: true,
  },
  {
    name: 'checkpoint',
    label: 'Base checkpoint',
    description: 'Base checkpoint to train from',
    default: 'dreamlike-art/dreamlike-photoreal-2.0',
    allowedValues: [
      'runwayml/stable-diffusion-v1-5',
      'prompthero/openjourney-v2',
      'dreamlike-art/dreamlike-photoreal-2.0'
    ],
    isRequired: true,
  },
  {
    name: 'name',
    label: 'LORA name',
    description: 'Name of the LORA to save',
    default: null,
    isRequired: true,
  },
  {
    name: 'use_template',
    label: 'Template',
    description: 'Which template to train from',
    default: 'person',
    allowedValues: ['person', 'object', 'style'],
    isRequired: true,
  },
  {
    name: 'train_text_encoder',
    label: 'Train text encoder',
    description: 'Train text encoder',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'perform_inversion',
    label: 'Perform inversion',
    description: 'Perform textual inversion',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'resolution',
    label: 'Resolution',
    description: 'Image resolution',
    default: 512,
    minimum: 256,
    maximum: 1024,
    optional: true,
  },
  {
    name: 'train_batch_size',
    label: 'Batch size',
    description: 'Training batch size',
    default: 4,
    minimum: 1,
    maximum: 16,
    optional: true,
  },
  {
    name: 'gradient_accumulation_steps',
    label: 'Gradient accumulation steps',
    description: 'Gradient accumulation steps',
    default: 1,
    minimum: 1,
    maximum: 8,
    optional: true,
  },
  {
    name: 'scale_lr',
    label: 'Scale learning rate',
    description: 'Scale learning rate',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'learning_rate_ti',
    label: 'Textual inversion learning rate',
    description: 'Learning rate for textual inversion',
    default: 2.5e-4,
    minimum: 1e-5,
    maximum: 1e-3,
    step: 1e-5,
    optional: true,
  },
  {
    name: 'continue_inversion',
    label: 'Continue inversion',
    description: 'Continue inversion',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'continue_inversion_lr',
    label: 'Continue inversion learning rate',
    description: 'Continue inversion learning rate',
    default: 2.5e-5,
    minimum: 1e-6,
    maximum: 1e-4,
    step: 1e-6,
    optional: true,
  },
  {
    name: 'learning_rate_unet',
    label: 'U-Net learning rate',
    description: 'Learning rate for U-Net',
    default: 1.5e-5,
    minimum: 1e-6,
    maximum: 1e-4,
    step: 1e-6,
    optional: true,
  },
  {
    name: 'learning_rate_text',
    label: 'Text encoder learning rate',
    description: 'Learning rate for text encoder',
    default: 2.5e-5,
    minimum: 1e-6,
    maximum: 1e-4,
    step: 1e-6,
    optional: true,
  },
  {
    name: 'color_jitter',
    label: 'Color jitter',
    description: 'Color jitter',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'lr_scheduler',
    label: 'LR scheduler',
    description: 'Learning rate scheduler',
    default: 'linear',
    allowedValues: ['linear', 'cosine', 'cosine_with_restarts', 'polynomial', 'constant', 'constant_with_warmup'],
    optional: true,
  },
  {
    name: 'lr_warmup_steps',
    label: 'Warmup steps',
    description: 'Learning rate warmup steps',
    default: 0,
    minimum: 0,
    maximum: 1000,
    optional: true,
  },
  // {
  //   name: 'placeholder_tokens',
  //   label: 'Placeholder tokens',
  //   description: 'Placeholder tokens for concept',
  //   default: '<person1>',
  //   optional: true,
  //   isRequired: true,
  // },
  {
    name: 'use_mask_captioned_data',
    label: 'Use mask captioned data',
    description: 'Use mask captioned data',
    default: false,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'max_train_steps_ti',
    label: 'Textual inversion max steps',
    description: 'Max train steps for textual inversion',
    default: 300,
    minimum: 5,
    maximum: 1000,
    optional: true,
  },
  {
    name: 'max_train_steps_tuning',
    label: 'Tuning max steps',
    description: 'Max train steps for tuning (U-Net and text encoder)',
    default: 500,
    minimum: 5,
    maximum: 1000,
    optional: true,
  },
  {
    name: 'clip_ti_decay',
    label: 'CLIP textual inversion decay',
    description: 'CLIP textual inversion decay',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'weight_decay_ti',
    label: 'Textual inversion weight decay',
    description: 'Weight decay for textual inversion',
    default: 0.0005,
    minimum: 0.0001,
    maximum: 0.001,
    step: 0.0001,
    optional: true,
  },
  {
    name: 'weight_decay_lora',
    label: 'Weight decay',
    description: 'Weight decay for LORA matrices',
    default: 0.001,
    minimum: 0.0001,
    maximum: 0.01,
    step: 0.001,
    optional: true,
  },
  {
    name: 'lora_rank_unet',
    label: 'U-Net rank',
    description: 'LORA rank for U-Net',
    default: 2,
    minimum: 1,
    maximum: 20,
    optional: true,
  },
  {
    name: 'lora_rank_text_encoder',
    label: 'Text encoder rank',
    description: 'LORA rank for text encoder',
    default: 8,
    minimum: 1,
    maximum: 20,
    optional: true,
  },
  {
    name: 'use_extended_lora',
    label: 'Extended LORA',
    description: 'Use extended LORA',
    default: false,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'use_face_segmentation_condition',
    label: 'Face segmentation',
    description: 'Use face segmentation condition',
    default: true,
    allowedValues: [false, true],
    optional: true,
  }
]

const ttsParameters = [
  {
    name: 'text',
    label: 'Text',
    description: 'Text to synthesize as speech',
    default: null,
    isRequired: true,
  },
  {
    name: 'preset',
    label: 'Preset',
    description: 'Speed vs quality mode',
    default: 'standard',
    allowedValues: ['ultra_fast', 'fast', 'standard', 'high_quality'],
  },
  {
    name: 'voice',
    label: 'Voice',
    description: 'Name of the voice to use for synthesis',
    default: 'random',
    allowedValues: ['random', 'clone', 'angie', 'applejack', 'cond_latent_example', 'daniel', 'deniro', 'emma', 'freeman', 'geralt', 'halle', 'jlaw', 'lj', 'mol', 'myself', 'pat', 'pat2', 'rainbow', 'snakes', 'tim_reynolds', 'tom', 'train_atkins', 'train_daws', 'train_dotrice', 'train_dreams', 'train_empire', 'train_grace', 'train_kennard', 'train_lescault', 'train_mouse', 'weaver', 'william'],
  },
  {
    name: 'voice_file_urls',
    label: 'Voice file URLs',
    description: 'URLs for the audio files of target voice (if voice is clone)',
    mediaUpload: true,
    default: [],
    minLength: 1,
    maxLength: 16,
  },
  {
    name: 'seed',
    label: 'Seed',
    description: 'Set random seed for reproducibility. If blank, will be set randomly.',
    default: null,
    minimum: 0,
    maximum: 1e8,
    optional: true,
  },
]
 
const wav2lipParameters = [
  {
    name: 'face_url',
    label: 'Face image file',
    description: 'Image containing face to be avatar',
    default: null,
    mediaUpload: true,
    isRequired: true,
  },
  {
    name: 'speech_url',
    label: 'Audio file',
    description: 'Audio of speech to be lip-synced',
    default: null,
    mediaUpload: true,
    isRequired: true,  
  },
  {
    name: 'gfpgan',
    label: 'GFPGAN',
    description: 'Apply GFPGAN to improve face image quality from Wav2Lip (recommended)',
    default: true,
    allowedValues: [false, true],
    optional: true,
  },
  {
    name: 'gfpgan_upscale',
    label: 'Upscale',
    description: 'Upsampling factor (only used if GFPGAN is enabled)',
    default: 1.0,
    allowedValues: [1.0, 2.0],
    optional: true,
  },
]

const completeParameters = [
  {
    name: 'prompt',
    label: 'Prompt',
    description: 'Prompt to complete with GPT-3',
    default: null,
    isRequired: true,
  },
  {
    name: 'max_tokens',
    label: 'Max tokens',
    description: 'Maximum number of tokens to generate with GPT-3',
    default: 150,
    minimum: 1,
    maximum: 2048,
    optional: true,
  },
  {
    name: 'temperature',
    label: 'Temperature',
    description: 'GPT-3 sampling temperature',
    default: 0.9,
    minimum: 0.0,
    maximum: 1.0,
    step: 0.01,
    optional: true,
  },
]

// Register generators
const createGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/eden-sd-pipelines',
  versionId: 'ff61b19a6c157e4cf2f41e54575f0060cae6a2ca6001184b0afdddc9d0a5e9f7',
  mode: 'generate',
  parameters: createParameters,
  isDeprecated: false,
}

const createGenerator = {
  generatorName: 'create',
  output: 'creation',
  versions: [createGeneratorVersion],
}

const interpolateGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/eden-sd-pipelines',
  versionId: 'ff61b19a6c157e4cf2f41e54575f0060cae6a2ca6001184b0afdddc9d0a5e9f7',
  mode: 'interpolate',
  parameters: interpolationParameters,
  isDeprecated: false,
}

const interpolateGenerator = {
  generatorName: 'interpolate',
  output: 'creation',
  versions: [interpolateGeneratorVersion],
}

const real2realGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/eden-sd-pipelines',
  versionId: 'ff61b19a6c157e4cf2f41e54575f0060cae6a2ca6001184b0afdddc9d0a5e9f7',
  mode: 'real2real',
  parameters: real2realParameters,
  isDeprecated: false
}

const real2realGenerator = {
  generatorName: 'real2real',
  output: 'creation',
  versions: [real2realGeneratorVersion]
}

const remixGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/eden-sd-pipelines',
  versionId: 'ff61b19a6c157e4cf2f41e54575f0060cae6a2ca6001184b0afdddc9d0a5e9f7',
  mode: 'remix',
  parameters: remixParameters,
  isDeprecated: false
}

const remixGenerator = {
  generatorName: 'remix',
  output: 'creation',
  versions: [remixGeneratorVersion]
}

const interrogateGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/eden-sd-pipelines',
  versionId: 'ff61b19a6c157e4cf2f41e54575f0060cae6a2ca6001184b0afdddc9d0a5e9f7',
  mode: 'interrogate',
  parameters: interrogateParameters,
  isDeprecated: false
}

const interrogateGenerator = {
  generatorName: 'interrogate',
  output: 'creation',
  versions: [interrogateGeneratorVersion]
}

const loraGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/eden-sd-lora',
  versionId: '953b0d4a2c1bcdfe069f0506c62c2640dc24d6e9494dfcd957fa607634243b9d',
  mode: 'lora',
  parameters: loraParameters,
  isDeprecated: false
}

const loraGenerator = {
  generatorName: 'lora',
  output: 'lora',
  versions: [loraGeneratorVersion]
}

const ttsGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/tts',
  versionId: '5496fcdfe66a24c26bf593006d4a5e91b5f9ed6f02c3eebef9147f7c131b3d69',
  mode: 'tts',
  parameters: ttsParameters,
  isDeprecated: false
}

const ttsGenerator = {
  generatorName: 'tts',
  output: 'creation',
  versions: [ttsGeneratorVersion]
}

const wav2lipGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/character',
  versionId: '959a4717d30a99331e162f051565eb286cfb19a2b0ab598d6fee369e510e0d75',
  mode: 'wav2lip',
  parameters: wav2lipParameters,
  isDeprecated: false
}

const wav2lipGenerator = {
  generatorName: 'wav2lip',
  output: 'creation',
  versions: [wav2lipGeneratorVersion]
}

const completeGeneratorVersion = {
  provider: 'replicate',
  address: 'abraham-ai/character',
  versionId: '959a4717d30a99331e162f051565eb286cfb19a2b0ab598d6fee369e510e0d75',
  mode: 'complete',
  parameters: completeParameters,
  isDeprecated: false
}

const completeGenerator = {
  generatorName: 'complete',
  output: 'llm',
  versions: [completeGeneratorVersion]
}


db.generators.insertMany([
  createGenerator,
  interpolateGenerator,
  real2realGenerator,
  remixGenerator,
  interrogateGenerator,
  loraGenerator,
  ttsGenerator,
  wav2lipGenerator,
  completeGenerator,
]);
