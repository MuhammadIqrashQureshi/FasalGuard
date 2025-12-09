const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReportService {
  constructor() {
    this.reportsDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generatePredictionReport(predictionData, userData = {}) {
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      info: {
        Title: `FasalGuard Crop Prediction Report - ${new Date().toLocaleDateString()}`,
        Author: 'FasalGuard AI System'
      }
    });

    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const filePath = path.join(this.reportsDir, `${reportId}.pdf`);
    
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      this.addHeader(doc);
      
      // Report Metadata
      this.addReportMetadata(doc, predictionData, userData);
      
      // Executive Summary
      this.addExecutiveSummary(doc, predictionData);
      
      // Weather Analysis
      this.addWeatherAnalysis(doc, predictionData);
      
      // Crop Recommendations
      this.addCropRecommendations(doc, predictionData);
      
      // ML Predictions
      this.addMLPredictions(doc, predictionData);
      
      // Irrigation Plan
      if (predictionData.irrigationData) {
        this.addIrrigationPlan(doc, predictionData);
      }
      
      // Comparison Matrix
      if (predictionData.comparisonData) {
        this.addComparisonMatrix(doc, predictionData);
      }
      
      // Action Plan
      this.addActionPlan(doc, predictionData);
      
      // Footer
      this.addFooter(doc);
      
      doc.end();
      
      stream.on('finish', () => {
        resolve({
          reportId,
          filePath,
          fileName: `FasalGuard_Report_${new Date().toISOString().split('T')[0]}.pdf`,
          downloadUrl: `/api/reports/download/${reportId}`
        });
      });
      
      stream.on('error', reject);
    });
  }

  addHeader(doc) {
    // Logo or Title
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#166534')
       .text('FASALGUARD', { align: 'center' });
    
    doc.fontSize(14)
       .font('Helvetica')
       .fillColor('#6b7280')
       .text('AI-Powered Agricultural Intelligence System', { align: 'center' });
    
    doc.moveDown();
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('CROP PREDICTION & RECOMMENDATION REPORT', { align: 'center' });
    
    doc.moveDown(0.5);
    doc.strokeColor('#16a34a')
       .lineWidth(2)
       .moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();
    
    doc.moveDown();
  }

  addReportMetadata(doc, predictionData, userData) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#374151')
       .text('Report Details', { underline: true });
    
    doc.moveDown(0.5);
    
    const details = [
      { label: 'Report ID', value: `FG${Date.now().toString().slice(-8)}` },
      { label: 'Generated On', value: new Date().toLocaleString() },
      { label: 'Location', value: predictionData.location?.city || userData.city || 'Not specified' },
      { label: 'Forecast Period', value: `${userData.days || 7} days` },
      { label: 'Analysis Engine', value: 'ML-Enhanced AI Prediction' },
      { label: 'ML Models Used', value: predictionData.analysis?.ml_predictions ? `${predictionData.analysis.ml_predictions}/5 crops` : 'All 5 crops' }
    ];
    
    details.forEach(detail => {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#4b5563')
         .text(`${detail.label}:`, 50, doc.y, { continued: true, width: 150 });
      
      doc.font('Helvetica-Bold')
         .fillColor('#1f2937')
         .text(detail.value, { width: 350 });
    });
    
    doc.moveDown();
  }

  addExecutiveSummary(doc, predictionData) {
    doc.addPage();
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('EXECUTIVE SUMMARY', { underline: true });
    
    doc.moveDown(0.5);
    
    const topCrop = predictionData.recommendations?.[0];
    const weatherStats = this.calculateWeatherStats(predictionData.forecast);
    
    doc.fontSize(11)
       .font('Helvetica')
       .fillColor('#374151')
       .text('Based on advanced machine learning analysis of weather patterns and historical data, this report provides intelligent crop recommendations tailored to your specific location and conditions.', {
         lineGap: 5
       });
    
    doc.moveDown();
    
    // Key Findings
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#166534')
       .text('Key Findings:');
    
    doc.moveDown(0.5);
    
    const findings = [
      `🎯 Top Recommended Crop: ${topCrop?.crop || 'Maize'} (Score: ${topCrop?.score || 85}%)`,
      `🌤️ Weather Outlook: ${weatherStats?.avgTemp ? `Avg Temp: ${weatherStats.avgTemp}°C` : 'Favorable conditions'}`,
      `💧 Water Availability: ${weatherStats?.totalRainfall > 20 ? 'Adequate' : 'Irrigation required'}`,
      `📈 ML Prediction Accuracy: ${predictionData.analysis?.ml_predictions ? '100% coverage' : 'High confidence'}`,
      `💰 Economic Potential: Top crop shows ${topCrop?.metrics?.ml_predicted_yield ? 'good' : 'excellent'} profit margins`
    ];
    
    findings.forEach((finding, i) => {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#4b5563')
         .text(`• ${finding}`, { indent: 20 });
    });
    
    doc.moveDown();
  }
addWeatherAnalysis(doc, predictionData) {
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .fillColor('#1f2937')
     .text('WEATHER ANALYSIS', { underline: true });
  
  doc.moveDown(0.5);
  
  // Extract forecast array properly
  let forecastArray;
  if (Array.isArray(predictionData.forecast)) {
    forecastArray = predictionData.forecast;
  } else if (predictionData.forecast && predictionData.forecast.forecast) {
    forecastArray = predictionData.forecast.forecast;
  } else {
    forecastArray = [];
  }
  
  if (forecastArray.length > 0) {
    const stats = this.calculateWeatherStats(forecastArray);
    
    const weatherInfo = [
      `📅 Forecast Period: ${forecastArray.length} days`,
      `🌡️ Average Temperature: ${stats.avgTemp}°C`,
      `🔥 Maximum Temperature: ${stats.maxTemp}°C`,
      `💧 Total Rainfall: ${stats.totalRainfall}mm`,
      `☀️ Dry Days: ${stats.dryDays}`,
      `⚠️ Heat Stress Days: ${stats.heatStressDays}`
    ];
    
    weatherInfo.forEach(info => {
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#4b5563')
         .text(info);
    });
    
    // Daily forecast table
    doc.moveDown();
    this.addWeatherTable(doc, forecastArray.slice(0, 7));
  } else {
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor('#6b7280')
       .text('No weather data available for analysis');
  }
  
  doc.moveDown();
}

  addWeatherTable(doc, forecast) {
    const tableTop = doc.y;
    const colWidths = [80, 60, 60, 60, 60];
    const headers = ['Date', 'Temp (°C)', 'Max (°C)', 'Rain (mm)', 'Condition'];
    
    // Headers
    doc.fontSize(9)
       .font('Helvetica-Bold')
       .fillColor('#ffffff')
       .rect(50, tableTop, 500, 20)
       .fill('#166534');
    
    let xPos = 55;
    headers.forEach((header, i) => {
      doc.text(header, xPos, tableTop + 5);
      xPos += colWidths[i];
    });
    
    // Data rows
    let yPos = tableTop + 25;
    forecast.forEach((day, i) => {
      if (i % 2 === 0) {
        doc.rect(50, yPos - 5, 500, 20)
           .fill('#f0fdf4');
      }
      
      xPos = 55;
      const rowData = [
        new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        day.T2M.toFixed(1),
        day.T2M_MAX.toFixed(1),
        day.PRECTOTCORR.toFixed(1),
        day.PRECTOTCORR > 5 ? 'Rainy' : day.T2M > 30 ? 'Hot' : 'Normal'
      ];
      
      doc.fontSize(9)
         .font('Helvetica')
         .fillColor('#1f2937');
      
      rowData.forEach((cell, j) => {
        doc.text(cell, xPos, yPos);
        xPos += colWidths[j];
      });
      
      yPos += 20;
    });
    
    doc.y = yPos + 10;
  }

  addCropRecommendations(doc, predictionData) {
    doc.addPage();
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('CROP RECOMMENDATIONS', { underline: true });
    
    doc.moveDown(0.5);
    
    if (predictionData.recommendations && predictionData.recommendations.length > 0) {
      predictionData.recommendations.slice(0, 3).forEach((crop, index) => {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor(index === 0 ? '#166534' : '#374151')
           .text(`${index + 1}. ${crop.crop} - Score: ${crop.score}% ${index === 0 ? '🏆 BEST MATCH' : ''}`);
        
        doc.moveDown(0.2);
        
        // Key metrics
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#4b5563')
           .text(`Predicted Yield: ${crop.metrics?.ml_predicted_yield || 'N/A'} tons/ha | Confidence: ${crop.metrics?.ml_confidence ? Math.round(crop.metrics.ml_confidence * 100) : 'N/A'}% | Water Needs: ${crop.waterRequirements || 'Moderate'}`);
        
        // Key advantages
        if (crop.advantages && crop.advantages.length > 0) {
          doc.moveDown(0.2);
          doc.fontSize(9)
             .fillColor('#16a34a')
             .text('Advantages: ' + crop.advantages.slice(0, 2).join(', '));
        }
        
        // Key recommendations
        if (crop.recommendation && crop.recommendation.length > 0) {
          doc.moveDown(0.2);
          doc.fontSize(9)
             .fillColor('#1d4ed8')
             .text('Action Plan: ' + crop.recommendation.slice(0, 2).join(', '));
        }
        
        doc.moveDown();
      });
    }
    
    doc.moveDown();
  }

  addMLPredictions(doc, predictionData) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('MACHINE LEARNING PREDICTIONS', { underline: true });
    
    doc.moveDown(0.5);
    
    if (predictionData.predictions) {
      Object.entries(predictionData.predictions).forEach(([crop, prediction]) => {
        if (prediction.success) {
          const pred = prediction.prediction;
          doc.fontSize(10)
             .font('Helvetica')
             .fillColor('#4b5563')
             .text(`${crop.charAt(0).toUpperCase() + crop.slice(1)}: ${pred.predicted_yield} tons/ha (${pred.confidence * 100}% confidence) - ${pred.recommendation?.status || 'MODERATE conditions'}`);
        }
      });
    }
    
    doc.moveDown();
  }

  addIrrigationPlan(doc, predictionData) {
    doc.addPage();
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('SMART IRRIGATION PLAN', { underline: true });
    
    doc.moveDown(0.5);
    
    if (predictionData.irrigationData) {
      const irrigation = predictionData.irrigationData;
      
      const planDetails = [
        `💧 Daily Water Requirement: ${irrigation.current_daily_water_req_mm} mm/day`,
        `🏭 Irrigation Method: ${irrigation.irrigation_method?.recommended || 'Sprinkler'} (${irrigation.irrigation_method?.efficiency || 80}% efficiency)`,
        `📅 Next Irrigation: ${irrigation.next_irrigation_date} (in ${irrigation.days_until_next_irrigation} days)`,
        `💦 Irrigation Depth: ${irrigation.irrigation_depth_mm} mm`,
        `📊 Volume Required: ${irrigation.irrigation_volume_m3} m³ for ${irrigation.area_ha} hectare`,
        `⏱️ Interval: Every ${irrigation.irrigation_interval_days} days`
      ];
      
      planDetails.forEach(detail => {
        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#4b5563')
           .text(detail);
      });
      
      // Water saving tips
      doc.moveDown();
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#166534')
         .text('Water Saving Tips:');
      
      doc.moveDown(0.2);
      
      if (irrigation.water_savings_tips) {
        irrigation.water_savings_tips.slice(0, 4).forEach(tip => {
          doc.fontSize(9)
             .font('Helvetica')
             .fillColor('#4b5563')
             .text(`• ${tip}`);
        });
      }
    }
    
    doc.moveDown();
  }

  addComparisonMatrix(doc, predictionData) {
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('CROP COMPARISON MATRIX', { underline: true });
    
    doc.moveDown(0.5);
    
    if (predictionData.comparisonData) {
      const tableTop = doc.y;
      const colWidths = [80, 50, 50, 50, 50, 50];
      const headers = ['Crop', 'Yield', 'Profit', 'ROI%', 'Water Eff.', 'Score'];
      
      // Headers
      doc.fontSize(9)
         .font('Helvetica-Bold')
         .fillColor('#ffffff')
         .rect(50, tableTop, 500, 20)
         .fill('#1d4ed8');
      
      let xPos = 55;
      headers.forEach((header, i) => {
        doc.text(header, xPos, tableTop + 5);
        xPos += colWidths[i];
      });
      
      // Data rows
      let yPos = tableTop + 25;
      predictionData.comparisonData.forEach((crop, i) => {
        if (i % 2 === 0) {
          doc.rect(50, yPos - 5, 500, 20)
             .fill('#f0f9ff');
        }
        
        xPos = 55;
        const rowData = [
          crop.crop,
          crop.predicted_yield?.toFixed(1) || 'N/A',
          `₹${crop.profit_per_ha?.toLocaleString() || '0'}`,
          `${crop.roi?.toFixed(1) || '0'}%`,
          crop.water_efficiency || 'Moderate',
          `${crop.composite_score?.toFixed(0) || '0'}`
        ];
        
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor(i === 0 ? '#166534' : '#1f2937');
        
        rowData.forEach((cell, j) => {
          doc.text(cell, xPos, yPos);
          xPos += colWidths[j];
        });
        
        yPos += 20;
      });
      
      doc.y = yPos + 10;
    }
    
    doc.moveDown();
  }

  addActionPlan(doc, predictionData) {
    doc.addPage();
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor('#1f2937')
       .text('COMPREHENSIVE ACTION PLAN', { underline: true });
    
    doc.moveDown(0.5);
    
    const topCrop = predictionData.recommendations?.[0];
    
    if (topCrop) {
      const plan = [
        { phase: 'IMMEDIATE (1-7 days)', actions: ['Prepare soil based on soil test', 'Procure quality seeds of recommended crop', 'Plan irrigation schedule', 'Arrange necessary equipment'] },
        { phase: 'SHORT TERM (1-4 weeks)', actions: ['Complete sowing/planting', 'Implement irrigation plan', 'Apply initial fertilizers', 'Set up pest monitoring'] },
        { phase: 'MID TERM (1-3 months)', actions: ['Regular irrigation as per schedule', 'Weed management', 'Pest and disease control', 'Growth monitoring'] },
        { phase: 'LONG TERM (3-6 months)', actions: ['Harvest planning', 'Market linkage establishment', 'Post-harvest management', 'Profit analysis and planning for next season'] }
      ];
      
      plan.forEach(phase => {
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .fillColor('#166534')
           .text(phase.phase);
        
        doc.moveDown(0.2);
        
        phase.actions.forEach(action => {
          doc.fontSize(10)
             .font('Helvetica')
             .fillColor('#4b5563')
             .text(`• ${action}`);
        });
        
        doc.moveDown(0.5);
      });
    }
    
    doc.moveDown();
  }

  addFooter(doc) {
    const pageHeight = doc.page.height;
    const footerY = pageHeight - 100;
    
    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#6b7280')
       .text('Disclaimer: This report is generated by AI and should be used as guidance. Always consult with local agricultural experts for final decisions.', 
             50, footerY, { width: 500, align: 'center' });
    
    doc.moveDown(0.5);
    doc.text('© 2024 FasalGuard - AI Agricultural Intelligence System. All predictions are based on machine learning models and weather data analysis.', 
             50, doc.y, { width: 500, align: 'center' });
    
    doc.text(`Report generated on: ${new Date().toLocaleString()} | Page ${doc.bufferedPageRange().count} of ${doc.bufferedPageRange().count}`, 
             50, doc.y + 20, { width: 500, align: 'center' });
  }

  calculateWeatherStats(forecast) {
  // Handle different forecast formats
  let forecastArray;
  
  if (Array.isArray(forecast)) {
    forecastArray = forecast;
  } else if (forecast && forecast.forecast && Array.isArray(forecast.forecast)) {
    // Handle nested structure: {forecast: [...], summary: {...}}
    forecastArray = forecast.forecast;
  } else if (forecast && forecast.data && Array.isArray(forecast.data)) {
    // Handle alternative structure
    forecastArray = forecast.data;
  } else {
    // Return defaults if no valid forecast found
    return { avgTemp: 0, maxTemp: 0, totalRainfall: 0, heatStressDays: 0, dryDays: 0 };
  }

  if (forecastArray.length === 0) {
    return { avgTemp: 0, maxTemp: 0, totalRainfall: 0, heatStressDays: 0, dryDays: 0 };
  }
  
  const temps = forecastArray.map(day => day.T2M || day.temperature || 0);
  const maxTemps = forecastArray.map(day => day.T2M_MAX || day.max_temp || day.T2M || 0);
  const rainfall = forecastArray.map(day => day.PRECTOTCORR || day.precipitation || 0);
  
  return {
    avgTemp: (temps.reduce((sum, temp) => sum + temp, 0) / temps.length).toFixed(1),
    maxTemp: Math.max(...maxTemps).toFixed(1),
    totalRainfall: rainfall.reduce((sum, rain) => sum + rain, 0).toFixed(1),
    heatStressDays: forecastArray.filter(day => (day.T2M_MAX || day.T2M || 0) > 35).length,
    dryDays: forecastArray.filter(day => (day.PRECTOTCORR || 0) === 0).length
  };
}
}

module.exports = new ReportService();