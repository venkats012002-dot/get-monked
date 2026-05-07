export interface ImageGenerateParams {
  prompt: string;
  size: "1024x1024";
}

export class ImageProvider {
  private static referenceImages = Array.from({ length: 16 }, (_, i) => ({
    url: `/monkeys/monke-${i + 1}.png`,
  }));

  static buildPrompt(): string {
    return "contemplative monkey, classical portrait";
  }

  static async generateImage(_params: ImageGenerateParams): Promise<string> {
    await new Promise((resolve) =>
      setTimeout(resolve, 600 + Math.random() * 600),
    );
    const pick =
      this.referenceImages[
        Math.floor(Math.random() * this.referenceImages.length)
      ];
    return pick.url;
  }

  static generateAlt(): string {
    return "A contemplative monkey portrait paired with an existential quote";
  }
}
