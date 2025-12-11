const QuickChart = require('quickchart-js');
const chartHelper = module.exports;
const constant = require('../constants/constant.json');
const h = require('../helpers');

/**
 * Generate Pie chart
 * @param data
 * @returns {Promise<string}
 */
chartHelper.generatePieChart = async (data) => {
  const pieChart = new QuickChart();
  const { timeData, labels } = data;

  pieChart.setConfig({
    type: 'pie',
    data: {
      labels: labels,
      datasets: [
        {
          data: timeData,
          backgroundColor: [
            '#E2EFD9',
            '#feb91a',
            '#fe5959',
            '#f2c4ab',
            '#6666eb',
          ],
        },
      ],
    },
    options: {
      legend: {
        display: true,
        position: 'right',
        align: 'center',
        labels: {
          fontSize: 30,
        },
      },
      plugins: {
        datalabels: {
          display: true,
          align: 'center',
          backgroundColor: '#eee',
          font: {
            color: '#666666',
            size: 30,
          },
        },
      },
    },
  });
  return pieChart.getUrl();
};

/**
 * Helper to generate piechart data based on property or project image settings
 * @param {obj} formattedData
 * @param {Array} shownImageTags
 * @return {obj}
 */
chartHelper.formatPieChartData = (formattedData, shownImageTags) => {
  const data = {};
  data.timeData = [];
  data.labels = [];

  for (const keyInx in shownImageTags) {
    const tag = shownImageTags[keyInx];
    const tagName = constant.SHORTLIST_PROPERTY.SETTING_FORMAT[tag];
    if (tagName) {
      data.timeData.push(formattedData.time_spent[tag]);
      data.labels.push(constant.SHORTLIST_PROPERTY.SETTING_FORMAT[tag]);
    }
  }

  return data;
};
