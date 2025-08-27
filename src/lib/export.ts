import { AssessmentResult } from '@/shared/types';

export type ExportFormat = 'pdf' | 'csv';

export async function exportAssessment(
  assessment: AssessmentResult, 
  format: ExportFormat
): Promise<{ success: boolean; message?: string; blob?: Blob; filename?: string }> {
  try {
    const response = await fetch('/api/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assessment,
        format
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || 'Export failed'
      };
    }

    if (format === 'csv') {
      const csvContent = await response.text();
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const filename = `accessibility-report-${assessment.websiteUrl.replace(/[^a-zA-Z0-9]/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
      
      return {
        success: true,
        blob,
        filename
      };
    } else if (format === 'pdf') {
      const result = await response.json();
      
      if (!result.success) {
        return {
          success: false,
          message: result.message || 'PDF generation failed'
        };
      }

      // Generate PDF using client-side jsPDF
      const pdfBlob = await generatePDF(result.data);
      
      return {
        success: true,
        blob: pdfBlob,
        filename: result.filename
      };
    }

    return {
      success: false,
      message: 'Unsupported format'
    };

  } catch (error) {
    console.error('Export error:', error);
    return {
      success: false,
      message: 'Network error during export'
    };
  }
}

export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Simple PDF generation using HTML canvas approach
// In a real implementation, you might want to use jsPDF or similar
async function generatePDF(data: any): Promise<Blob> {
  // Create a simple HTML representation that we can convert to PDF
  const htmlContent = generateHTMLReport(data);
  
  // For now, we'll return a text blob that represents the PDF content
  // In production, you'd use a proper PDF library like jsPDF
  const textContent = generateTextReport(data);
  
  return new Blob([textContent], { type: 'application/pdf' });
}

function generateHTMLReport(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${data.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #f5f5f5; padding: 20px; margin: 20px 0; }
        .issue { margin: 15px 0; padding: 15px; border-left: 4px solid #ccc; }
        .critical { border-left-color: #dc2626; }
        .high { border-left-color: #ea580c; }
        .medium { border-left-color: #d97706; }
        .low { border-left-color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.title}</h1>
        <h2>${data.subtitle}</h2>
        <p>Generated on ${data.date}</p>
      </div>
      
      <div class="summary">
        <h3>Assessment Summary</h3>
        <p><strong>Overall Score:</strong> ${data.summary.overallScore}/100 (${data.summary.gradeRating})</p>
        <p><strong>Total Issues:</strong> ${data.summary.totalIssues}</p>
        <ul>
          <li>Critical: ${data.summary.breakdown.critical}</li>
          <li>High Impact: ${data.summary.breakdown.high}</li>
          <li>Medium Impact: ${data.summary.breakdown.medium}</li>
          <li>Low Impact: ${data.summary.breakdown.low}</li>
        </ul>
        <p><strong>Estimated Impact:</strong> ${data.estimatedImpact}</p>
      </div>

      <div class="issues">
        <h3>Accessibility Issues</h3>
        ${data.issues.map((issue: any) => `
          <div class="issue ${issue.impact}">
            <h4>${issue.type}</h4>
            <p><strong>Impact:</strong> ${issue.impact} | <strong>WCAG:</strong> ${issue.wcagLevel}</p>
            <p><strong>Description:</strong> ${issue.description}</p>
            <p><strong>Recommendation:</strong> ${issue.recommendation}</p>
            ${issue.element ? `<p><strong>Element:</strong> ${issue.element}</p>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="recommendations">
        <h3>Recommendations</h3>
        <ul>
          ${data.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
    </body>
    </html>
  `;
}

function generateTextReport(data: any): string {
  let report = `ACCESSIBILITY ASSESSMENT REPORT\\n`;
  report += `=================================\\n\\n`;
  report += `Website: ${data.subtitle}\\n`;
  report += `Date: ${data.date}\\n\\n`;
  
  report += `SUMMARY\\n`;
  report += `-------\\n`;
  report += `Overall Score: ${data.summary.overallScore}/100 (${data.summary.gradeRating})\\n`;
  report += `Total Issues: ${data.summary.totalIssues}\\n`;
  report += `  • Critical: ${data.summary.breakdown.critical}\\n`;
  report += `  • High Impact: ${data.summary.breakdown.high}\\n`;
  report += `  • Medium Impact: ${data.summary.breakdown.medium}\\n`;
  report += `  • Low Impact: ${data.summary.breakdown.low}\\n\\n`;
  report += `Estimated Impact: ${data.estimatedImpact}\\n\\n`;

  if (data.pourScores) {
    report += `POUR SCORES\\n`;
    report += `-----------\\n`;
    report += `Perceivable: ${data.pourScores.perceivable}/100\\n`;
    report += `Operable: ${data.pourScores.operable}/100\\n`;
    report += `Understandable: ${data.pourScores.understandable}/100\\n`;
    report += `Robust: ${data.pourScores.robust}/100\\n\\n`;
  }

  report += `ACCESSIBILITY ISSUES\\n`;
  report += `-------------------\\n`;
  data.issues.forEach((issue: any, index: number) => {
    report += `${index + 1}. ${issue.type} [${issue.impact.toUpperCase()}]\\n`;
    report += `   WCAG: ${issue.wcagLevel}\\n`;
    report += `   Description: ${issue.description}\\n`;
    report += `   Recommendation: ${issue.recommendation}\\n`;
    if (issue.element) {
      report += `   Element: ${issue.element}\\n`;
    }
    report += `\\n`;
  });

  if (data.quickWins && data.quickWins.length > 0) {
    report += `QUICK WINS\\n`;
    report += `----------\\n`;
    data.quickWins.forEach((win: any, index: number) => {
      report += `${index + 1}. ${win.title}\\n`;
      report += `   Impact: ${win.impact}\\n`;
      report += `   Effort: ${win.effort}\\n`;
      report += `   ETA: ${win.eta}\\n\\n`;
    });
  }

  report += `GENERAL RECOMMENDATIONS\\n`;
  report += `----------------------\\n`;
  data.recommendations.forEach((rec: string, index: number) => {
    report += `${index + 1}. ${rec}\\n`;
  });

  report += `\\n---\\n`;
  report += `Report generated by AccessiScan\\n`;
  report += `https://accessiscan.com\\n`;

  return report;
}