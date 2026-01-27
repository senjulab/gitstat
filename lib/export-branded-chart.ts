import { toPng } from "html-to-image";

interface ExportOptions {
  backgroundColor?: string;
  pixelRatio?: number;
}

/**
 * Export a chart element as a branded PNG with "by gitstat.dev" footer
 */
export async function exportChartAsBrandedImage(
  chartElement: HTMLElement,
  filename: string,
  options: ExportOptions = {}
): Promise<void> {
  const { backgroundColor = "#ffffff", pixelRatio = 2 } = options;

  // Step 1: Capture the chart as a data URL
  const chartDataUrl = await toPng(chartElement, {
    backgroundColor,
    pixelRatio,
  });

  // Step 2: Load the chart image to get dimensions
  const chartImg = new Image();
  chartImg.src = chartDataUrl;
  await new Promise((resolve) => {
    chartImg.onload = resolve;
  });

  const chartWidth = chartImg.naturalWidth;
  const chartHeight = chartImg.naturalHeight;

  // Step 3: Build the export card in DOM (off-screen)
  const card = document.createElement("div");
  const padding = 48;
  const footerHeight = 48;
  const cardWidth = chartWidth + padding * 2;
  const cardHeight = chartHeight + padding * 2 + footerHeight;

  card.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: ${cardWidth}px;
    height: ${cardHeight}px;
    background-color: #fafafa;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // Chart container
  const chartContainer = document.createElement("div");
  chartContainer.style.cssText = `
    padding: ${padding}px;
    padding-bottom: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  `;

  // Chart image
  const img = document.createElement("img");
  img.src = chartDataUrl;
  img.style.cssText = `
    width: ${chartWidth}px;
    height: ${chartHeight}px;
    border-radius: 8px;
  `;
  chartContainer.appendChild(img);
  card.appendChild(chartContainer);

  // Footer
  const footer = document.createElement("div");
  footer.style.cssText = `
    height: ${footerHeight}px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding-bottom: 8px;
  `;

  // Logo
  const logo = document.createElement("img");
  logo.src = "/logo-icon.svg";
  logo.style.cssText = `
    width: 20px;
    height: 20px;
    border-radius: 50%;
  `;
  footer.appendChild(logo);

  // Text
  const text = document.createElement("span");
  text.textContent = "by gitstat.dev";
  text.style.cssText = `
    font-size: 14px;
    color: #666666;
    font-weight: 500;
  `;
  footer.appendChild(text);

  card.appendChild(footer);

  // Append to body
  document.body.appendChild(card);

  // Wait for logo to load
  await new Promise((resolve) => {
    if (logo.complete) {
      resolve(true);
    } else {
      logo.onload = () => resolve(true);
      logo.onerror = () => resolve(true); // Continue even if logo fails
    }
  });

  // Small delay to ensure layout is complete
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Step 4: Capture the card
  try {
    const cardDataUrl = await toPng(card, {
      backgroundColor: "#fafafa",
      pixelRatio,
    });

    // Step 5: Download
    const link = document.createElement("a");
    link.href = cardDataUrl;
    link.download = filename;
    link.click();
  } finally {
    // Clean up
    document.body.removeChild(card);
  }
}
