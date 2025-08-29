import puppeteer, { Browser, Page } from 'puppeteer';
import { 
  EnrichedAnalysisData, 
  PageMetadata, 
  ImageAnalysis, 
  FormAnalysis, 
  HeadingInfo, 
  LinkInfo, 
  ColorAnalysis, 
  InteractiveElementInfo,
  LandmarkInfo,
  AccessibilityNode,
  ElementInfo
} from './analysis-types';

export class AccessibilityCrawler {
  private browser: Browser | null = null;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async extractPageData(url: string): Promise<EnrichedAnalysisData> {
    if (!this.browser) {
      await this.initialize();
    }

    if (!this.browser) {
      throw new Error('Browser not initialized');
    }
    const page = await this.browser.newPage();
    const startTime = Date.now();
    
    try {
      // Set viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Navigate to page
      const response = await page.goto(url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      if (!response || !response.ok()) {
        throw new Error(`Failed to load page: ${response?.status()}`);
      }

      const pageLoadTime = Date.now() - startTime;

      // Extract all data in parallel
      const [
        htmlSource,
        pageMetadata,
        images,
        forms,
        headings,
        links,
        colors,
        interactiveElements,
        landmarks,
        accessibilityTree,
        additionalData
      ] = await Promise.all([
        this.extractHtmlSource(page),
        this.extractPageMetadata(page),
        this.extractImages(page),
        this.extractForms(page),
        this.extractHeadings(page),
        this.extractLinks(page),
        this.extractColors(page),
        this.extractInteractiveElements(page),
        this.extractLandmarks(page),
        this.extractAccessibilityTree(page),
        this.extractAdditionalData(page)
      ]);

      const extractionTime = Date.now() - startTime;

      return {
        url,
        htmlSource,
        pageMetadata,
        images,
        forms,
        headings,
        links,
        colors,
        interactiveElements,
        landmarks,
        accessibilityTree,
        ...additionalData,
        extractionMetadata: {
          timestamp: new Date().toISOString(),
          extractionTime,
          pageLoadTime,
          errors: [],
          warnings: []
        }
      };

    } catch (error) {
      throw new Error(`Crawling failed: ${error}`);
    } finally {
      await page.close();
    }
  }

  private async extractHtmlSource(page: Page): Promise<string> {
    return await page.content();
  }

  private async extractPageMetadata(page: Page): Promise<PageMetadata> {
    return await page.evaluate(() => {
      return {
        title: document.title,
        lang: document.documentElement.lang || undefined,
        viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') || undefined,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || undefined,
        charset: document.characterSet || undefined
      };
    });
  }

  private async extractImages(page: Page): Promise<ImageAnalysis[]> {
    return await page.evaluate(() => {
      const images: ImageAnalysis[] = [];
      
      // Regular img elements
      const imgElements = document.querySelectorAll('img');
      imgElements.forEach((img, index) => {
        const rect = img.getBoundingClientRect();
        const alt = img.getAttribute('alt');
        
        images.push({
          src: img.src,
          alt: alt || undefined,
          selector: `img:nth-of-type(${index + 1})`,
          dimensions: { width: rect.width, height: rect.height },
          isDecorative: alt === '',
          hasEmptyAlt: alt === '',
          isBackgroundImage: false,
          context: img.closest('figure')?.textContent?.trim() || 
                  img.parentElement?.textContent?.trim()?.substring(0, 100)
        });
      });
      // Background images - limit to likely candidates
      const elementsWithBgImages = document.querySelectorAll(
        'div, section, header, main, aside, footer, [style*="background"]'
      );
      elementsWithBgImages.forEach((el, index) => {
        const styles = window.getComputedStyle(el);
        const bgImage = styles.backgroundImage;
        
        if (bgImage && bgImage !== 'none' && bgImage.includes('url(')) {
          const urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
          if (urlMatch) {
            const rect = el.getBoundingClientRect();
            images.push({
              src: urlMatch[1],
              alt: el.getAttribute('aria-label') || undefined,
              selector: `${el.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
              dimensions: { width: rect.width, height: rect.height },
              isDecorative: !el.getAttribute('aria-label'),
              hasEmptyAlt: false,
              isBackgroundImage: true,
              context: el.textContent?.trim()?.substring(0, 100)
            });
          }
        }
      });

      return images;
    });
  }

  private async extractForms(page: Page): Promise<FormAnalysis> {
    return await page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      const allInputs = Array.from(document.querySelectorAll('input, select, textarea'));
      
      const unlabeledInputs: ElementInfo[] = [];
      const missingFieldsets: ElementInfo[] = [];
      const missingRequired: ElementInfo[] = [];
      
      allInputs.forEach((input, index) => {
        const rect = input.getBoundingClientRect();
        const elementInfo: ElementInfo = {
          selector: `${input.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          tagName: input.tagName,
          text: input.textContent?.trim(),
          attributes: Object.fromEntries(
            Array.from(input.attributes).map(attr => [attr.name, attr.value])
          ),
          boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
        };

        // Check for labels
        const id = input.getAttribute('id');
        const hasLabel = id ? document.querySelector(`label[for="${id}"]`) : null;
        const hasAriaLabel = input.getAttribute('aria-label') || input.getAttribute('aria-labelledby');
        
        if (!hasLabel && !hasAriaLabel) {
          unlabeledInputs.push(elementInfo);
        }

        // Check for required fields
        if (input.hasAttribute('required') && !input.getAttribute('aria-required')) {
          missingRequired.push(elementInfo);
        }
      });

      // Check for radio/checkbox groups without fieldsets
      const radioGroups = new Map<string, Element[]>();
      document.querySelectorAll('input[type="radio"]').forEach(radio => {
        const name = radio.getAttribute('name');
        if (name) {
          if (!radioGroups.has(name)) radioGroups.set(name, []);
          radioGroups.get(name)!.push(radio);
        }
      });

      radioGroups.forEach((radios, name) => {
        if (radios.length > 1) {
          const hasFieldset = radios.some(radio => radio.closest('fieldset'));
          if (!hasFieldset) {
            radios.forEach((radio, index) => {
              const rect = radio.getBoundingClientRect();
              missingFieldsets.push({
                selector: `input[name="${name}"]:nth-of-type(${index + 1})`,
                tagName: radio.tagName,
                text: radio.textContent?.trim(),
                attributes: Object.fromEntries(
                  Array.from(radio.attributes).map(attr => [attr.name, attr.value])
                ),
                boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
              });
            });
          }
        }
      });

      return {
        unlabeledInputs,
        missingFieldsets,
        noErrorAssociation: [], // TODO: Implement error association check
        missingRequired,
        poorInstructions: [], // TODO: Implement instruction quality check
        inaccessibleValidation: [], // TODO: Implement validation accessibility check
        forms: forms.map((form, index) => ({
          selector: `form:nth-of-type(${index + 1})`,
          inputs: Array.from(form.querySelectorAll('input, select, textarea')).map((input, inputIndex) => {
            const rect = input.getBoundingClientRect();
            return {
              selector: `${input.tagName.toLowerCase()}:nth-of-type(${inputIndex + 1})`,
              tagName: input.tagName,
              text: input.textContent?.trim(),
              attributes: Object.fromEntries(
                Array.from(input.attributes).map(attr => [attr.name, attr.value])
              ),
              boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
            };
          }),
          hasSubmit: !!form.querySelector('input[type="submit"], button[type="submit"], button:not([type])'),
          hasValidation: !!form.querySelector('[required], [pattern], [min], [max]')
        }))
      };
    });
  }

  private async extractHeadings(page: Page): Promise<HeadingInfo[]> {
    return await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      
      return headings.map((heading, index) => {
        const rect = heading.getBoundingClientRect();
        const level = parseInt(heading.tagName.charAt(1));
        const text = heading.textContent?.trim() || '';
        
        return {
          selector: `${heading.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          tagName: heading.tagName,
          text,
          attributes: Object.fromEntries(
            Array.from(heading.attributes).map(attr => [attr.name, attr.value])
          ),
          boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          level,
          isEmpty: text.length === 0,
          hasProperNesting: true // TODO: Calculate proper nesting
        };
      });
    });
  }

  private async extractLinks(page: Page): Promise<LinkInfo[]> {
    return await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      const genericTexts = ['click here', 'read more', 'more', 'link', 'here', 'more info'];
      
      return links.map((link, index) => {
        const rect = link.getBoundingClientRect();
        const text = link.textContent?.trim() || '';
        const href = link.getAttribute('href') || '';
        
        return {
          selector: `a:nth-of-type(${index + 1})`,
          tagName: link.tagName,
          text,
          attributes: Object.fromEntries(
            Array.from(link.attributes).map(attr => [attr.name, attr.value])
          ),
          boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          href,
          hasGenericText: genericTexts.some(generic => text.toLowerCase().includes(generic)),
          isEmptyLink: text.length === 0,
          hasTitle: !!link.getAttribute('title'),
          opensInNewWindow: link.getAttribute('target') === '_blank'
        };
      });
    });
  }

  private async extractColors(page: Page): Promise<ColorAnalysis[]> {
    return await page.evaluate(() => {
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label');
      const colors: ColorAnalysis[] = [];

      textElements.forEach((element, index) => {
        const text = element.textContent?.trim();
        if (!text || text.length === 0) return;

        const styles = window.getComputedStyle(element as Element);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor || 'rgb(255, 255, 255)';
        const fontSizePx = styles.fontSize;
        const fontSize = parseFloat(fontSizePx);

        const toHexColor = (colorStr: string) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = colorStr;
          return ctx.fillStyle as string;
        };

        const fg = toHexColor(color);
        const bg = toHexColor(backgroundColor);

        const getLuminance = (hexColor: string) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          ctx.fillStyle = hexColor;
          const hex = ctx.fillStyle as string;
          const r = parseInt(hex.substr(1, 2), 16) / 255;
          const g = parseInt(hex.substr(3, 2), 16) / 255;
          const b = parseInt(hex.substr(5, 2), 16) / 255;
          const sRGB = [r, g, b].map(c =>
            c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
          );
          return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
        };

        const fgLum = getLuminance(fg);
        const bgLum = getLuminance(bg);
        const contrast = (Math.max(fgLum, bgLum) + 0.05) / (Math.min(fgLum, bgLum) + 0.05);

        colors.push({
          foreground: fg,
          background: bg,
          selector: `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          contrast,
          meetsAA: contrast >= 4.5,
          meetsAAA: contrast >= 7,
          fontSize,
          isLargeText:
            fontSize >= 18 ||
            (fontSize >= 14 && (styles.fontWeight === 'bold' || parseInt(styles.fontWeight, 10) >= 700)),
          context: text.substring(0, 50)
        });
      });

      return colors;
    });
  }

  private async extractInteractiveElements(page: Page): Promise<InteractiveElementInfo[]> {
    return await page.evaluate(() => {
      const interactiveSelectors = 'button, a[href], input, select, textarea, [tabindex], [onclick], [role="button"], [role="link"]';
      const elements = Array.from(document.querySelectorAll(interactiveSelectors));
      
      return elements.map((element, index) => {
        const rect = element.getBoundingClientRect();
        const tabIndex = element.getAttribute('tabindex');
        
        return {
          selector: `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          tagName: element.tagName,
          text: element.textContent?.trim(),
          attributes: Object.fromEntries(
            Array.from(element.attributes).map(attr => [attr.name, attr.value])
          ),
          boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          isFocusable: tabIndex !== '-1',
          hasVisibleFocus: true, // TODO: Check computed focus styles
          tabIndex: tabIndex ? parseInt(tabIndex) : undefined,
          role: element.getAttribute('role') || undefined,
          ariaLabel: element.getAttribute('aria-label') || undefined,
          ariaDescribedBy: element.getAttribute('aria-describedby') || undefined,
          touchTargetSize: { width: rect.width, height: rect.height },
          meetsTouchTargetSize: rect.width >= 44 && rect.height >= 44
        };
      });
    });
  }

  private async extractLandmarks(page: Page): Promise<LandmarkInfo[]> {
    return await page.evaluate(() => {
      const landmarkSelectors = 'header, nav, main, aside, footer, [role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"]';
      const elements = Array.from(document.querySelectorAll(landmarkSelectors));
      
      return elements.map((element, index) => {
        const rect = element.getBoundingClientRect();
        const role = element.getAttribute('role') || element.tagName.toLowerCase();
        
        let landmarkType: any = 'region';
        if (role === 'banner' || element.tagName === 'HEADER') landmarkType = 'banner';
        else if (role === 'navigation' || element.tagName === 'NAV') landmarkType = 'navigation';
        else if (role === 'main' || element.tagName === 'MAIN') landmarkType = 'main';
        else if (role === 'complementary' || element.tagName === 'ASIDE') landmarkType = 'complementary';
        else if (role === 'contentinfo' || element.tagName === 'FOOTER') landmarkType = 'contentinfo';
        
        return {
          selector: `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          tagName: element.tagName,
          text: element.textContent?.trim(),
          attributes: Object.fromEntries(
            Array.from(element.attributes).map(attr => [attr.name, attr.value])
          ),
          boundingBox: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          landmarkType,
          hasLabel: !!(element.getAttribute('aria-label') || element.getAttribute('aria-labelledby')),
          isUnique: true // TODO: Check for uniqueness
        };
      });
    });
  }

  private async extractAccessibilityTree(page: Page): Promise<AccessibilityNode[]> {
    // This is a simplified version - full implementation would use Chrome DevTools Protocol
    return await page.evaluate(() => {
      const getAccessibilityInfo = (element: Element): AccessibilityNode => {
        return {
          name: element.getAttribute('aria-label') || element.textContent?.trim() || undefined,
          role: element.getAttribute('role') || undefined,
          selector: element.tagName.toLowerCase(),
          properties: {
            tagName: element.tagName,
            id: element.id || undefined,
            className: element.className || undefined
          }
        };
      };
      
      const importantElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, button, a, input, select, textarea, [role]');
      return Array.from(importantElements).map(getAccessibilityInfo);
    });
  }

  private async extractAdditionalData(page: Page) {
    return await page.evaluate(() => {
      const skipLinks = document.querySelectorAll('a[href^="#"]');
      const h1Elements = document.querySelectorAll('h1');
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const landmarks = document.querySelectorAll('header, nav, main, aside, footer, [role="banner"], [role="navigation"], [role="main"], [role="complementary"], [role="contentinfo"]');
      
      return {
        hasSkipLinks: skipLinks.length > 0,
        languageAttributes: Array.from(document.querySelectorAll('[lang]')).map((el, index) => ({
          selector: `${el.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          lang: el.getAttribute('lang') || ''
        })),
        mediaElements: Array.from(document.querySelectorAll('video, audio')).map((el, index) => ({
          selector: `${el.tagName.toLowerCase()}:nth-of-type(${index + 1})`,
          type: el.tagName.toLowerCase() as 'video' | 'audio',
          hasControls: el.hasAttribute('controls'),
          hasTranscript: false, // TODO: Detect transcript
          hasCaptions: false, // TODO: Detect captions
          autoPlays: el.hasAttribute('autoplay')
        })),
        documentStructure: {
          hasH1: h1Elements.length > 0,
          h1Count: h1Elements.length,
          headingHierarchy: Array.from(headings).map(h => parseInt(h.tagName.charAt(1))),
          landmarkCount: landmarks.length,
          skipLinkCount: skipLinks.length
        }
      };
    });
  }
}

// Utility function for single-use crawling
export async function crawlPage(url: string): Promise<EnrichedAnalysisData> {
  const crawler = new AccessibilityCrawler();
  try {
    return await crawler.extractPageData(url);
  } finally {
    await crawler.cleanup();
  }
}
